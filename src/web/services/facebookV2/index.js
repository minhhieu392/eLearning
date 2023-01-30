import getAllMessages from './getAllMessages';
import getAllUnreadMessage from './getAllUnreadMessage';
import getConversationId from './getConversationId';
import getLongLiveUserAccessToken from './getLongLiveUserAccessToken';
import getMessagesFromUser from './getMessagesFromUser';
import getPageAccessToken from './getPageAccessToken';
import getPageId from './getPageId';
import getPageInfo from './getPageInfo';
import getUserAccessToken from './getUserAccessToken';
import markReadMessage from './markReadMessage';
import sendText from './sendText';
import sendBroadcastMessage from './sendBroadcastMessage';
import sendQuickPhoneRely from './sendQuickPhoneRely';
import sendQuickReplies from './sendQuickReplies';
import subscribeApp from './subscribeApp';
import sendFile from './sendFile';
import sendAlbum from './sendAlbum';
import getUserInfo from './getUserInfo';
import getPagePosts from './getPagePosts';
import getPostComments from './getPostComments';
import hideComment from './hideComment';
import getCommentDetail from './getCommentDetail'
import deleteComment from './deleteComment'
import replyComment from './replyComments';
import sendTemplates from './sendTemplates';
import addWhiteListedDomain from './addWhiteListedDomain';
import getWhiteListedDomain from './getWhiteListedDomain';
export default {
  getAllMessages,
  getAllUnreadMessage,
  getConversationId,
  getLongLiveUserAccessToken,
  getMessagesFromUser,
  getPageAccessToken,
  getPageId,
  getPageInfo,
  getUserAccessToken,
  markReadMessage,
  sendText,
  sendBroadcastMessage,
  sendQuickPhoneRely,
  sendQuickReplies,
  subscribeApp,
  sendFile,
  sendImage: sendFile,
  sendAlbum,
  getUserInfo,
  getPagePosts,
  getPostComments,
  hideComment,
  getCommentDetail,
  deleteComment,
  replyComment,
  sendTemplates,
  addWhiteListedDomain,
  getWhiteListedDomain
};
