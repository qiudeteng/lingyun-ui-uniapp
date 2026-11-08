/**
 * 兼容旧路径：通用上传工具已移到 src/uni_modules/lingyun-ui/utils/upload.ts。
 * 新代码请直接从 utils/upload 引入。
 */
export {
  buildUploadHeader,
  isAbortError,
  parseUploadResponse,
  uploadWithUni,
  type LingyunUploadFile as LingyunImageUploadFile,
  type LingyunUploadFn as LingyunImageUploadFn,
  type LingyunUploadRequestOptions as UploadRequestOptions,
  type LingyunUploadRequestResult as UploadRequestResult,
  type LingyunUploadTask as LingyunImageUploadTask,
} from '../../utils/upload'
