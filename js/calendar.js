// const calendar = document.getElementById('calendar');
// let cal
//
// let cal_sets = {
//   scale: 0.1,
//   start: {
//     kw: 4,
//     year: 2022
//   },
//   end: {
//     kw: 8,
//     year: 2022
//   },
//   displayDate: "top-left", // "top-left", "top-right", "bottom-left", "bottom-right"
//
//   start_x: 90,
//   start_y: 60,
//   overlap: 20,
//   fontsize: 20,
//   small_fontsize: 15,
// }
//
// function resizeCalendarCanvas() {
//   const clientHeight = cal.canvas.clientHeight
//   const clientWidth = cal.canvas.clientWidth
//
//   cal.canvas.height = clientHeight
//   cal.canvas.width = clientWidth
// }
//
// async function setup() {
//   if(calendar) {
//     cal = calendar.getContext('2d');
//     resizeCalendarCanvas()
//
//
//     // canvas.addEventListener("mousemove", mousemovement, false);
//     // canvas.addEventListener("click", mouseclick, false);
//   }
// }
//
// function mousemovement(e) {
//   mouseX = event.clientX - calendar.offsetLeft;
//   mouseY = event.clientY - calendar.offsetTop;
// }
//
// function mouseclick(e) {
//   console.log(e)
//   //checkButtonClick()
// }
//
// setup()
//
// function drawCalendar() {
//   cal.strokeStyle = '#ffffff';
//   cal.fillStyle = '#ffffff';
//   cal.lineWidth = 1;
//
//   //console.log("drawing horizontal Lines")
//   cal.beginPath();
//   for(let h = 0; h <= settings.endtime-settings.starttime; h+=1) {
//     let y_start = settings.start_y + h*settings.spacings.hour*settings.scale
//     let x_start = settings.start_x-settings.overlap;
//     let x_end = x_start+settings.spacings.day*7*settings.scale+settings.overlap*2
//     cal.moveTo(x_start, y_start);
//     cal.lineTo(x_end, y_start);
//   }
//   cal.stroke();
//
//   //console.log("drawing vertical Lines")
//   cal.beginPath();
//   for(let d = 0; d <= 7; d+=1) {
//     let x_start = settings.start_x + d*settings.spacings.day*settings.scale
//     let y_start = settings.start_y - settings.overlap
//     let y_end = settings.start_y+(settings.endtime-settings.starttime)*settings.spacings.hour*settings.scale+settings.overlap
//     cal.moveTo(x_start, y_start);
//     cal.lineTo(x_start, y_end);
//   }
//   cal.stroke();
//
//
//   //console.log("adding Weekdays")
//   cal.font = (settings.fontsize*settings.scale)+"px "+fontfamily
//   cal.fillStyle = "#ffffff"
//   cal.textAlign="center";
//   cal.textBaseline = "middle";
//
//
//   currentWeek.forEach((day, index) => {
//     let name = daysOfWeek[index]
//     let text = name
//     //console.log(text)
//     let center_x = settings.start_x+settings.spacings.day*settings.scale*index+settings.spacings.day*settings.scale/2
//     let center_y = settings.start_y-settings.spacings.hour*settings.scale/2+8*settings.scale
//     cal.fillText(text, center_x, center_y);
//   })
//
//
//   cal.textAlign = "right"
//   //console.log("adding Time")
//   for(let h = 0; h < 4; h+=1) {
//     let text = h
//     let posy = settings.start_y + h*settings.spacings.hour*settings.scale
//     cal.fillText(text, settings.start_x-30, posy)
//   }
// }
//
// drawCalendar()
//
// function textWidth(text) {
//   cal.measureText(text).width
// }
