import moment from "moment";

const fileFormat = (url) => {
    const fileExtension = url.split(".").pop();

    if (fileExtension === "mp4" || fileExtension === "webm" || fileExtension === "ogg" || fileExtension === "mov")
        return "video"

    if (fileExtension === "mp3" || fileExtension === "wav")
        return "audio"

    if (fileExtension === "png" || fileExtension === "jpeg" || fileExtension === "jpg" || fileExtension === "gif")
        return "image"

    return "file"
}

// https://res.cloudinary.com/duu6feowh/image/upload/dpr_auto/w_400/v1726925759/ce99d7f6-b6b1-4bf3-b352-81df86436a07.png
const transformImage = (url = "", width = 100) => {

    // const newUrl = url.replace('upload',`upload/dpr_auto/w_${width}/`)
    return url
}

const getLast7Days = () =>{
    const currentDate = moment();

    const last7Days = [];

    for(let i=0;i<7;i++){
        const dayName = currentDate.clone().subtract(i,"days").format("dddd");
        last7Days.unshift(dayName)
    }
    return last7Days    
}

const getOrSaveFromLocalStorage = ({key,value,get})=>{
    if(get){
        return localStorage.getItem(key)?JSON.parse(localStorage.getItem(key)):null
    }else{
        // console.log("else")
        localStorage.setItem(key,JSON.stringify(value))
    }
}
export { fileFormat, transformImage, getLast7Days, getOrSaveFromLocalStorage }