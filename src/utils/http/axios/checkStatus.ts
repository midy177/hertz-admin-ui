import type { ErrorMessageMode } from '/#/axios';
import { useMessage } from '/@/hooks/web/useMessage';
import { useI18n } from '/@/hooks/web/useI18n';
import { useUserStoreWithOut } from '/@/store/modules/user';
import projectSetting from '/@/settings/projectSetting';
import { SessionTimeoutProcessingEnum } from '/@/enums/appEnum';
import httpStatus from 'http-status';

const { createMessage, createErrorModal } = useMessage();
const error = createMessage.error!;
const stp = projectSetting.sessionTimeoutProcessing;

export function checkStatus(
  status: number,
  msg: string,
  errorMessageMode: ErrorMessageMode = 'message',
): void {
  const { t } = useI18n();
  const userStore = useUserStoreWithOut();
  let errMessage = '';

  switch (status) {
    case httpStatus.BAD_REQUEST:
      errMessage = t(msg);
      break;
    // 401: Not logged in
    // Jump to the login page if not logged in, and carry the path of the current page
    // Return to the current page after successful login. This step needs to be operated on the login page.
    case httpStatus.UNAUTHORIZED:
      userStore.setToken(undefined);
      if (msg != null && msg != '' && msg != undefined) {
        errMessage = t(msg);
      } else {
        errMessage = t('sys.api.statusMsg401');
      }
      if (stp === SessionTimeoutProcessingEnum.PAGE_COVERAGE) {
        userStore.setSessionTimeout(true);
      } else {
        userStore.logout(true);
      }
      break;
    case httpStatus.FORBIDDEN:
      errMessage = t('sys.api.statusMsg403');
      break;
    // 404请求不存在
    case httpStatus.NOT_FOUND:
      errMessage = t('sys.api.statusMsg404');
      break;
    case httpStatus.METHOD_NOT_ALLOWED:
      errMessage = t('sys.api.statusMsg405');
      break;
    case httpStatus.REQUEST_TIMEOUT:
      errMessage = t('sys.api.statusMsg408');
      break;
    case httpStatus.INTERNAL_SERVER_ERROR:
      errMessage = t('sys.api.statusMsg500');
      break;
    case httpStatus.NOT_IMPLEMENTED:
      errMessage = t('sys.api.statusMsg501');
      break;
    case httpStatus.BAD_GATEWAY:
      errMessage = t('sys.api.statusMsg502');
      break;
    case httpStatus.SERVICE_UNAVAILABLE:
      errMessage = t('sys.api.statusMsg503');
      break;
    case httpStatus.GATEWAY_TIMEOUT:
      errMessage = t('sys.api.statusMsg504');
      break;
    case httpStatus.HTTP_VERSION_NOT_SUPPORTED:
      errMessage = t('sys.api.statusMsg505');
      break;
    default:
  }

  if (errMessage) {
    if (errorMessageMode === 'modal') {
      createErrorModal({
        title: t('sys.api.errorTip'),
        content: errMessage,
      });
    } else if (errorMessageMode === 'message') {
      error({ content: errMessage, key: `global_error_message_status_${status}` });
    }
  }
}
