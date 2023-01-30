import sendText from './sendText';
import replyKeyboardMarkup from './replyKeyboardMarkup';
import convertKeyboard2D from './convertKeyboard2D';
import sendFile from './sendFile';
import sendAlbum from './sendAlbum';
import getUserInfo from './getUserInfo';
import getMe from '../../../services/telegram/getMe';
import sendQuickReplies from './sendQuickReplies';
export default { sendQuickReplies,sendMessage: sendText,sendText, replyKeyboardMarkup, convertKeyboard2D, sendFile,sendImage:sendFile, sendAlbum, getUserInfo, getMe};
