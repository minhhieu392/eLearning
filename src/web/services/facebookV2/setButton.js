export default (params) => {
  const typeList = ['postback', 'web_url'];
  if (typeList.indexOf(params.type) === -1) {
    throw new Error(`type must be in : ${typeList}`);
  } else {
    const button = {};
    button.type = params.type;
    button.title = params.title;
    (params.type === 'postback') ? button.payload = params.payload : button.url = params.url;

    return button;
  }
}
