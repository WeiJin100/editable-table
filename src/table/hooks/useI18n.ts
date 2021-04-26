import { isNotNull } from '../../utils/common';

const useI18n = (i18nData: any, language: string) => {
  /**
   * obj 占位符替换
   * @param key
   * @param {any} obj
   * @return {string}
   */
  const p = (key: string, obj: any = null) => {
    let msg = '';
    if (i18nData && key in i18nData) {
      msg = i18nData[key];
    }
    if (isNotNull(obj) && isNotNull(msg)) {
      // 兼容老版本分隔符%key%
      msg = msg.replace(/{(\w+)}/g, (_, key) => obj[key]).replace(/%(\w+)%/g, (_, key) => obj[key]);
    }
    return msg;
  };
  return {
    p,
    language,
  };
};

export default useI18n;
