const margin = 10;
const chunkSize = 50;
const input = document.querySelector("input");
const canvas = document.querySelector("canvas");

const ctx = canvas.getContext("2d");
const ac = new AudioContext();

const { width, height } = canvas;

const centerHeight = Math.ceil(height / 2);
const scaleFactor = (height - margin * 2) / 2;

async function drawToCanvas() {
  const arrayBuffer = await input.files[0].arrayBuffer();
  const audioBuffer = await ac.decodeAudioData(arrayBuffer);

  const float32Array = audioBuffer.getChannelData(0);
  const array = [];
  let i = 0;
  const length = float32Array.length;
  while (i < length) {
    array.push(
      float32Array.slice(i, i += chunkSize).reduce(function (total, value) {
        return Math.max(total, Math.abs(value));
      })
    );
  }
  canvas.width = Math.ceil(float32Array.length / chunkSize + margin * 2);
  for (let index in array) {
    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.moveTo(margin + Number(index), centerHeight - array[index] * scaleFactor);
    ctx.lineTo(margin + Number(index), centerHeight + array[index] * scaleFactor);
    // ctx.****();
  }
}
input.addEventListener("input", drawToCanvas);