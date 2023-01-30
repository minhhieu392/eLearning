import axios from 'axios'
import _ from 'lodash';
// eslint-disable-next-line require-jsdoc
const setOptions = (userId, text,quickReplies) => {
    let body = {};

    console.log("quickReplies", quickReplies )
  
    if(!_.isEmpty(quickReplies)) {
        quickReplies = quickReplies.map(item => ({
        "content_type": "text",
        "title": item,
        "payload": item,
         }));
    }

    console.log("quickReplies",JSON.stringify(quickReplies))
    
    if (!_.isEmpty(quickReplies)) {
        body= {
            recipient: {
                "id": `${userId}`
            },
            message: {
                "text": `${text}`,
                "quick_replies": quickReplies 
            },
            messaging_type: "RESPONSE",
        };
    }
    else {
        body = {
            recipient: {
                "id": `${userId}`
            },
            message: {
                "text": `${text}`,
            },
            messaging_type: "RESPONSE",
        };
    }
    // console.log("body",body)

    return {
        body: JSON.stringify(body),
    }
};

export default {
    connectFacebookApi: async (data) => {
        let output = {};

        const accessToken = data.accessToken;
        const userId =  data.userId;
        const text = data.text || "";
        const quickReplies = data.quickReplies;
        
        if(text !== "") {
            console.log("accessToken=%s || userId=%s || text=%s || quickReplies=%s ", accessToken, userId, text,quickReplies)
            const options = setOptions(userId,text, quickReplies);

            console.log("options   ",options)
            console.log("options body   ",options.body)
            // return new Promise((resolve, reject) => {
            await axios({
                method: 'post',
                url: 'https://graph.facebook.com/v5.0/me/messages?access_token='+accessToken,
                data: options.body,
                headers: {
                "Content-Type": "application/json"
                }
            })
            .then(function (response) {
                // console.log("kết thúc response -----------------------------------------------------------------",response.data);
                console.log("Ket noi thanh cong**********************************");
                
                // return  { data: response.data };
                output = {
                    data: response.data
                }
            })
            .catch(function (error) {
                console.log("Ket noi that bai**********************************");
                // console.log("kết thúc error -----------------------------------------------------------------", error);

                output = {
                    data: null
                }
            });
        // );
        }

        return output;
     }
};