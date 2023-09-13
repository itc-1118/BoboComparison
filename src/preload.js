const { ipcRenderer } = require("electron");
const main = require("./libs/Diff");

ipcRenderer.diff = main;
