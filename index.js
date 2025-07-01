function toggleMenu() {
  const menu = document.getElementById("sideMenu");
  if (menu.style.display === "flex") {
    menu.style.display = "none";
  } else {
    menu.style.display = "flex";
    menu.style.flexDirection = "column";
  }
}

function talkToSakhi() {
  alert("Launching your Sakhi – AI support in your language (coming soon!)");
  console.log("Talk to Sakhi button clicked");
}

