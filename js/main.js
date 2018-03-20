// Dom Elements
const latitude = document.getElementById('latValue');
const longitude = document.getElementById('longValue');
const results = document.getElementById('results');
const tbody = document.getElementById('tbody');
const warning = document.getElementById('warning');
const loader = document.getElementById('loader');
let myLocation = {};

rgx = /\s/g;


// Initialize App
getLocation();

// Open and close more info
tbody.addEventListener('click', showHide);

// Get current user location
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(myPosition, myPositionEmpty)
  } else {
    alert("This browser doesn't support geolocation");
  }
}

function myPosition(position) {
  myLocation.lat = position.coords.latitude;
  myLocation.lon = position.coords.longitude;
  let url = `https://cors-anywhere.herokuapp.com/http://public-api.adsbexchange.com/VirtualRadar/AircraftList.json?trFmt=sa&lat=${myLocation.lat}&lng=${myLocation.lon}&fDstL=0&fDstU=100`;
  let fLat = myLocation.lat.toFixed(3);
  let fLong = myLocation.lon.toFixed(3);
  latitude.textContent = `${fLat}`
  longitude.textContent = `${fLong}`;
  sendRequest(url);
  setInterval(() => {
    sendRequest(url);
  }, 60000);
}

function myPositionEmpty() {
  loader.style.display = "none";
  const div = document.createElement("div");
  div.className = "allow-geolocation";
  div.innerHTML = `<p>In order to see flight listings above your head, please allow your location.</p>
      <img src="images/map-marker.svg" alt="map-marker">`
  warning.appendChild(div);
  warning.style.display = "block";
}

let outsideResolve;
let outsideReject;

function getLogo(company) {
  let logoUrl = `https://company.clearbit.com/v1/domains/find?name=${company}`;
  return new Promise((resolve, reject) => {
    fetch(logoUrl, {
        headers: {
          "Authorization": "Bearer sk_7a22326ee08442fdc6ef82faf4b02b4b"
        }
      })
      .then(res => res.json())
      .then(data => resolve(data))
      .catch(err => reject(err));
  })
}

function sendRequest(url) {
  let myRequest = new XMLHttpRequest();
  myRequest.open("GET", url, true);
  myRequest.onload = function () {
    if (myRequest.status >= 200 && myRequest.status < 400) {
      loader.style.display = "none";
      let myData = JSON.parse(myRequest.responseText);
      // console.log(myData.acList);
      tbody.style.display = "block";
      let sorter = [];
      myData.acList.forEach((item) => {
        myVal = {
          direction: (item.Trak > 180) ? "west" : "east",
          altitude: Math.floor(item.Alt * 0.3048),
          flightCode: item.Call,
          manufacturer: item.Man,
          model: item.Mdl,
          from: item.From ? item.From : "Not Avaiable",
          to: item.To ? item.To : "Not Avaiable",
          company: item.Op
        }
        sorter.push(myVal);
      })
      sorter.sort(function (a, b) {
        return b.altitude - a.altitude;
      });

      let output = "";

      sorter.forEach((item, index) => {
        let logoRegex;
        if (typeof item.company == "string") {
          logoRegex = item.company.replace(rgx, "");
        }
        let source;
        getLogo(logoRegex)
          .then(data => {
            source = data.logo;
            if (source !== undefined && source !== null) {
              document.getElementById(`logo${index}`).src = source;
            } else {
              document.getElementById(`logo${index}`).src = "../images/airLogo.svg";
            }
          });
        let direction = item.direction === "west" ? "plane-180" : "";
        let altImg = item.direction === "west" ? "airplane going West" : "airplane going East";
        output += `
        <tr class="mainInfo">
              <td>${index+1}.</td>
              <td>
                <img class="${direction}" src="images/airplaneLeft.svg" alt="${altImg}">
              </td>
              <td>${item.altitude}</td>
              <td>${item.flightCode}</td>
              <td>
              <i class="fas fa-chevron-circle-down toggler"></i>
              </td>
            </tr>
            <tr class="moreInfo">
              <td colspan="2">Manufacturer: ${item.manufacturer}</td>
              <td colspan="2">Model : ${item.model}</td>
            </tr>
            <tr class="from">
              <td>From: ${item.from}</td>
            </tr>
            <tr class="to">
              <td>To: ${item.to}</td>
            </tr>
            <tr class="logo">
              <td>
                <img id="logo${index}" class="logoSource" src="">
              </td>
            </tr>`;
      })
      tbody.innerHTML = output;
    }
  }
  myRequest.send();
}

function showHide(e) {
  if (e.target.parentElement.classList.contains('toggler')) {
    let showInfo = e.target.parentElement.parentElement.parentElement.nextElementSibling;
    let showInfo2 = showInfo.nextElementSibling;
    let showInfo3 = showInfo2.nextElementSibling;
    let showInfo4 = showInfo3.nextElementSibling;
    if (showInfo.classList.contains("show") && showInfo2.classList.contains("show") && showInfo3.classList.contains("show") && showInfo4.classList.contains("show")) {
      showInfo.classList.remove("show");
      showInfo2.classList.remove("show");
      showInfo3.classList.remove("show");
      showInfo4.classList.remove("show");
    } else {
      showInfo.classList.add("show");
      showInfo2.classList.add("show");
      showInfo3.classList.add("show");
      showInfo4.classList.add("show");
    }
  }
}