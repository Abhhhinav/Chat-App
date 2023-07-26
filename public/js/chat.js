const socket = io();
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocationButton = document.querySelector("#Send-location");
const $messages = document.querySelector("#messages");
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationMessageTemplate = document.querySelector("#location-message-template").innerHTML;
const sideBarTemplate = document.querySelector('#sidebar-template').innerHTML


const autoscroll = () => {
  //new Message Element
   const $newMessage = $messages.lastElementChild

   //Height of the new element
   const newMessageStyles = getComputedStyle($newMessage)
   const newMessagemargin = parseInt(newMessageStyles.marginBottom)
   const newMessageheight = $newMessage.offsetHeight + newMessagemargin

   //Visible height
   const VisibleHeight = $messages.offsetHeight

   //Height of the Message container
   const conatinerHeight = $messages.scrollHeight

   //how far I have scrolled
   const scrollOffset =  $messages.scrollTop + VisibleHeight

   if(conatinerHeight - newMessageheight <= scrollOffset){
    $messages.scrollTop = $messages.scrollHeight
   }
}
socket.on("message", (message) => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    username : message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll()
});


socket.on("Locationmessage", (message) => {
  console.log(message);
  const html = Mustache.render(locationMessageTemplate, {
    username : message.username,
    url: message.url,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll()
});

socket.on("roomData",({room,users})=>{
  const html = Mustache.render(sideBarTemplate,{
    room,
    users
  })
  document.querySelector('#sidebar').innerHTML = html
})

const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix : true}) 

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  $messageFormButton.setAttribute("disabled", "disabled");

  const message = e.target.elements.message.value;
  socket.emit("sendMessage", message, (error) => {
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();
    if (error) {
      return console.log(error);
    }
    console.log("Message Delivered");

  });
});


$sendLocationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geo location is not supported for your browser");
  }
  $sendLocationButton.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((GeolocationPosition) => {
    socket.emit("SendLocation",
      {
        latitude: GeolocationPosition.coords.latitude,
        longitude: GeolocationPosition.coords.longitude,
      }, () => {
          console.log("Location Shared");
          $sendLocationButton.removeAttribute("disabled");
      }
    );
  });
});
socket.emit('join',{username,room},(error)=>{
   if(error){
    alert(error)
    location.href = '/'
   }
})