import { cleanup } from "@testing-library/react"
import "@testing-library/jest-dom/vitest"
import { afterEach } from "vitest"

if (typeof HTMLDialogElement !== "undefined") {
  HTMLDialogElement.prototype.showModal ??= function showModal(this: HTMLDialogElement) {
    this.setAttribute("open", "")
  }
  HTMLDialogElement.prototype.close ??= function close(this: HTMLDialogElement) {
    this.removeAttribute("open")
    this.dispatchEvent(new Event("close"))
  }
}

afterEach(() => {
  cleanup()
  document.body.innerHTML = ""
})
