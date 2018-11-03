var show_apple = function() {
  document.getElementById("apple").style.display = "block";
  document.getElementById("win").style.display = "none";
  document.getElementById("linux").style.display = "none";
};

var show_win = function() {
  document.getElementById("apple").style.display = "none";
  document.getElementById("win").style.display = "block";
  document.getElementById("linux").style.display = "none";
};

var show_linux = function() {
  document.getElementById("apple").style.display = "none";
  document.getElementById("win").style.display = "none";
  document.getElementById("linux").style.display = "block";
};

var show_applegui = function() {
  document.getElementById("applegui").style.display = "block";
  document.getElementById("applecli").style.display = "none";
  document.getElementById("wingui").style.display = "none";
  document.getElementById("wincli").style.display = "none";
  document.getElementById("linuxgui").style.display = "none";
  document.getElementById("linuxcli").style.display = "none";
  
};

var show_applecli = function() {
  document.getElementById("applegui").style.display = "none";
  document.getElementById("applecli").style.display = "block";
  document.getElementById("wingui").style.display = "none";
  document.getElementById("wincli").style.display = "none";
  document.getElementById("linuxgui").style.display = "none";
  document.getElementById("linuxcli").style.display = "none";
  
};

var show_wingui = function() {
  document.getElementById("applegui").style.display = "none";
  document.getElementById("applecli").style.display = "none";
  document.getElementById("wingui").style.display = "block";
  document.getElementById("wincli").style.display = "none";
  document.getElementById("linuxgui").style.display = "none";
  document.getElementById("linuxcli").style.display = "none";
  
};

var show_wincli = function() {
  document.getElementById("applegui").style.display = "none";
  document.getElementById("applecli").style.display = "none";
  document.getElementById("wingui").style.display = "none";
  document.getElementById("wincli").style.display = "block";
  document.getElementById("linuxgui").style.display = "none";
  document.getElementById("linuxcli").style.display = "none";
  
};

var show_linuxgui = function() {
  document.getElementById("applegui").style.display = "none";
  document.getElementById("applecli").style.display = "none";
  document.getElementById("wingui").style.display = "none";
  document.getElementById("wincli").style.display = "none";
  document.getElementById("linuxgui").style.display = "block";
  document.getElementById("linuxcli").style.display = "none";
  
};

var show_linuxcli = function() {
  document.getElementById("applegui").style.display = "none";
  document.getElementById("applecli").style.display = "none";
  document.getElementById("wingui").style.display = "none";
  document.getElementById("wincli").style.display = "none";
  document.getElementById("linuxgui").style.display = "none";
  document.getElementById("linuxcli").style.display = "block";
  
};
