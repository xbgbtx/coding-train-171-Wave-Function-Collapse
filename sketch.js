function setup() {
  const title = "171 - Wave Function Collapse";
  document.getElementById("sketch-title").innerText = title;
  window.document.title = title;

  createCanvas(800, 600);
}

function draw() {
  if (mouseIsPressed) {
    fill(0);
  } else {
    fill(255);
  }
  ellipse(mouseX, mouseY, 80, 80);
}
