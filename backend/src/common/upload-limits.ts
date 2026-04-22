/**
 * Max multipart file size for game media and lobby video (binary MB).
 * Keep in sync with nginx `client_max_body_size` and frontend checks.
 */
export const MAX_UPLOAD_FILE_BYTES = 500 * 1024 * 1024;
