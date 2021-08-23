export const SOCK_EVENTS = {
  connected: "SOCK_CONN",
  disconnected: "SOCK_DISCONN",

  request_userid: "SOCK_REQ_UID",
  request_room_info: "SOCK_REQ_RIF",
  request_professional_available: "SOCK_REQ_PROF_AVAIL",
  request_professional_select: "SOCK_REQ_PROF_SELECT",
  request_chat: "SOCK_REQ_CHAT_INC",
  request_chat_page: "SOCK_REQ_CHAT_PAGE",

  respond_userid: "SOCK_RES_UID",
  respond_room_info: "SOCK_RES_RIF",
  respond_professional_available: "SOCK_RES_PROF_AVAIL",
  respond_professional_select: "SOCK_RES_PROF_SELECT",
  respond_chat_ok: "SOCK_RES_CHAT_OK",
  respond_chat_na: "SOCK_RES_CHAT_NA",
  respond_chat_page: "SOCK_RES_CHAT_PAGE",

  message: "SOCK_MSG",
  message_reply: "SOCK_MSG_RPL",

  std_error: "SOCK_STD_ERR",
  std_chat_state: "SOCK_CHAT_STATE",
};
