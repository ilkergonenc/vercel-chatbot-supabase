import { createClient } from '@supabase/supabase-js'
import type { ChatMessage } from '@/lib/types'

export const attachmentBucketName = process.env.SUPABASE_STORAGE_BUCKET ?? 'chat-attachments'

const SIGNED_URL_EXPIRY_SECONDS = Number(process.env.SUPABASE_STORAGE_SIGNED_URL_EXPIRES_IN ?? 3600)

type FilePart = {
  type: 'file'
  mediaType: string
  name: string
  url: string
}

function createStorageClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!(supabaseUrl && serviceRoleKey)) {
    return null
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

function shouldUseSignedAttachmentUrls() {
  return ['1', 'true', 'yes'].includes(
    (process.env.SUPABASE_STORAGE_SIGNED_URLS ?? '').toLowerCase(),
  )
}

export async function getAttachmentUrl(path: string) {
  const storage = createStorageClient()

  if (!storage) {
    throw new Error('Supabase Storage is not configured.')
  }

  if (shouldUseSignedAttachmentUrls()) {
    const { data, error } = await storage.storage
      .from(attachmentBucketName)
      .createSignedUrl(path, SIGNED_URL_EXPIRY_SECONDS)

    if (error || !data?.signedUrl) {
      console.warn('Failed to create signed chat attachment URL', {
        bucket: attachmentBucketName,
        path,
        error: error?.message,
      })
      throw new Error('Failed to prepare attachment URL.')
    }

    return data.signedUrl
  }

  const { data } = storage.storage.from(attachmentBucketName).getPublicUrl(path)
  return data.publicUrl
}

function isFilePart(part: ChatMessage['parts'][number]): part is FilePart {
  return (
    part.type === 'file' &&
    'url' in part &&
    'name' in part &&
    'mediaType' in part &&
    typeof part.url === 'string' &&
    typeof part.name === 'string' &&
    typeof part.mediaType === 'string'
  )
}

function getAttachmentPath(part: FilePart) {
  if (part.name && !part.name.startsWith('http')) {
    return part.name
  }

  try {
    const url = new URL(part.url)
    const publicPrefix = `/storage/v1/object/public/${attachmentBucketName}/`
    const signedPrefix = `/storage/v1/object/sign/${attachmentBucketName}/`

    for (const prefix of [publicPrefix, signedPrefix]) {
      if (url.pathname.startsWith(prefix)) {
        return decodeURIComponent(url.pathname.slice(prefix.length))
      }
    }
  } catch (_) {
    return null
  }

  return null
}

function isPrivateOrLocalHost(hostname: string) {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname.endsWith('.local') ||
    hostname.startsWith('10.') ||
    hostname.startsWith('192.168.') ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
  )
}

function redactUrl(url: string) {
  try {
    const parsedUrl = new URL(url)
    parsedUrl.search = parsedUrl.search ? '?[redacted]' : ''
    return parsedUrl.toString()
  } catch (_) {
    return '[invalid-url]'
  }
}

function validateModelDownloadUrl(url: string) {
  try {
    const parsedUrl = new URL(url)

    if (parsedUrl.protocol !== 'https:') {
      return 'Attachment URL must use HTTPS for OpenAI file downloads.'
    }

    if (isPrivateOrLocalHost(parsedUrl.hostname)) {
      return 'Attachment URL points to a local or private host that OpenAI cannot download.'
    }
  } catch (_) {
    return 'Attachment URL is invalid.'
  }

  return null
}

async function resolveAttachmentUrl(part: FilePart) {
  const path = getAttachmentPath(part)

  if (!path) {
    const validationError = validateModelDownloadUrl(part.url)
    if (validationError) {
      console.warn('Invalid chat attachment URL', {
        reason: validationError,
        url: redactUrl(part.url),
      })
      throw new Error(validationError)
    }

    return part.url
  }

  const url = await getAttachmentUrl(path)
  const validationError = validateModelDownloadUrl(url)

  if (validationError) {
    console.warn('Invalid chat attachment URL for model download', {
      reason: validationError,
      url: redactUrl(url),
      bucket: attachmentBucketName,
      path,
    })
    throw new Error(validationError)
  }

  return url
}

export async function resolveAttachmentUrlsForModel(
  messages: ChatMessage[],
): Promise<ChatMessage[]> {
  return await Promise.all(
    messages.map(async (message) => ({
      ...message,
      parts: await Promise.all(
        message.parts.map(async (part) => {
          if (!isFilePart(part)) {
            return part
          }

          const url = await resolveAttachmentUrl(part)
          return {
            ...part,
            url,
          }
        }),
      ),
    })),
  )
}

export { createStorageClient }
