const { WebClient, retryPolicies } = require('@slack/web-api');
/**
 * @param {{blocks: {blocks: [{text: {text: string, type: string}, type: string, accessory: {alt_text: string, image_url: string, type: string}, block_id: string}, {elements: [{text: string, type: string}], type: string}]}, channel: string, accessToken: string, type: string}} params
 * @param {String} params.accessToken
 * @param {String} params.channel
 * @param {String} params.text
 * @param {Array} params.attachments
 * @param {Object} params.blocks
 * */

export default async params => {
  const result = {};
  const accessToken = params.accessToken;
  const channel = params.channel;
  const text = params.text;
  const attachments = params.attachments;
  const blocks = params.blocks;
  const web = new WebClient(accessToken, {
    retryConfig: retryPolicies.fiveRetriesInFiveMinutes
  });

  try {
    console.log('a3', accessToken, text, channel, attachments, blocks);
    await web.chat.postMessage({
      accessToken,
      text,
      channel,
      attachments,
      blocks
    });

    result.success = true;
  } catch (error) {
    console.log('err', error);
    result.success = false;
    result.error = error;
  }

  return result;
};
