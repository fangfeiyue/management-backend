const CODE = {
  SUCCESS: 200, // 成功
  PARAM_ERROR: 10001, // 参数错误
  USER_ACCOUNT_ERROR: 20001, // 账号或密码错误
  USER_LOGIN_ERROR: 30001, // 用户未登录
  BUSINESS_ERROR: 40001, // 业务请求失败
  AUTH_ERROR: 50001 // 认证失败或 token 过期
};

module.exports = {
  parge({ pageNum=1, pageSize=10 }) {
    pageNum *= 1;
    pageSize *= 1;
    const skipIndex = (pageNum - 1) * pageSize;
    return {
      page: {
        pageNum,
        pageSize
      },
      skipIndex
    };
  },
  success(data, msg, code = CODE.SUCCESS) {
    return {
      code, data, msg
    };
  },
  fail(msg='', code = CODE.BUSINESS_ERROR) {
    return {
      msg, code
    }
  },
  CODE
};
