var bounding_box_colors = {};
var confidence = 0.6;
var isWebcamActive = false; // Flag to track webcam activation


function drawBoundingBoxes(predictions, canvas, ctx, user_stated_confidence = 0.5) {
  for (var i = 0; i < predictions.length; i++) {
    var confidence = predictions[i].confidence;

    if (confidence < user_stated_confidence) {
      continue;
    }

    if (predictions[i].class in bounding_box_colors) {
      ctx.strokeStyle = bounding_box_colors[predictions[i].class];
    } else {
      var o = Math.round, r = Math.random, s = 255;
      ctx.strokeStyle = "#" + Math.floor(Math.random() * 16777215).toString(16);
      bounding_box_colors[predictions[i].class] = ctx.strokeStyle;
    }

    var rect = canvas.getBoundingClientRect();

    var prediction = predictions[i];
    var x = prediction.bbox.x - prediction.bbox.width / 2;
    var y = prediction.bbox.y - prediction.bbox.height / 2;
    var width = prediction.bbox.width;
    var height = prediction.bbox.height;

    var scaling = window.devicePixelRatio;

    ctx.rect(x, y, width, height);

    ctx.fillStyle = "rgba(0, 0, 0, 0)";
    ctx.fill();

    ctx.fillStyle = ctx.strokeStyle;
    ctx.lineWidth = "4";
    ctx.strokeRect(x, y, width, height);
    ctx.font = "25px Arial";
    ctx.fillText(prediction.class + " " + Math.round(confidence * 100) + "%", x, y - 10);
  }
}
// Create a button to activate the webcam
var activateWebcamButton = document.createElement("button");
activateWebcamButton.textContent = "Activate Webcam";
activateWebcamButton.style.padding = "10px 20px";
activateWebcamButton.style.fontSize = "16px";
activateWebcamButton.style.cursor = "pointer";
activateWebcamButton.style.backgroundColor = "#4CAF50"; /* Green background color */
activateWebcamButton.style.color = "white"; /* White text color */
activateWebcamButton.style.border = "none";
activateWebcamButton.style.borderRadius = "5px";
activateWebcamButton.style.marginTop = "30px"; /* Add spacing between the button and the canvas */
activateWebcamButton.style.display = "block"; /* Change display property to block */
activateWebcamButton.style.marginLeft = "auto"; /* Center the button horizontally */
activateWebcamButton.style.marginRight = "auto";

// Append the button to the body
document.body.appendChild(activateWebcamButton);

// Add event listener to activate the webcam on button click
activateWebcamButton.addEventListener("click", function () {
  // Check if webcam is already active
  if (!isWebcamActive) {
    // Set the flag to true
    isWebcamActive = true;

    // Continue with webcam activation code
    var video = document.createElement("video");
    video.setAttribute("autoplay", "");
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");

    var canvas = document.createElement("canvas");
    canvas.setAttribute("width", "720");
    canvas.setAttribute("height", "480");
    document.getElementById("canvas").appendChild(canvas);

    var ctx = canvas.getContext("2d");

    navigator.mediaDevices.getUserMedia({ video: true, audio: false }).then(function (stream) {
      video.srcObject = stream;
      video.play();

      roboflow.auth({
        publishable_key: "rf_9n5BLWvJ4sPiVjwOJnkSRhf2HFD2"
      }).load({
        model: "smoke-detection-2-new",
        version: 2
      }).then(function (model) {
        setInterval(function () {
          model.detect(video).then(function (predictions) {
            // draw frame on canvas
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            drawBoundingBoxes(predictions, canvas, ctx, confidence);
          });
        }, 1000 / 30);
      });
    });
  }
});
// Function to deactivate the webcam
function deactivateWebcam() {
  // Check if webcam is already active
  if (isWebcamActive) {
    // Set the flag to false
    isWebcamActive = false;
  }
}