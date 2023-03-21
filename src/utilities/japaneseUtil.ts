import axios from "axios";
export async function toRomaji(keyword: string) {
    let reqBody = {
        "str": keyword,
        "to": "romaji",
        "mode": "normal",
        "romajiSystem": "passport"
    };
    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://api.kuroshiro.org/convert',
        headers: { 
          'Content-Type': 'application/json'
        },
        data : reqBody
      };
    let response: any;
    try {
        response = await axios.request(config);
        return response.data.result;
    } catch (error) {
        console.log(error);
        return '';
    }
}