export default function moveToNextField(e, fieldId) {
  if (e.keyCode === 13) {
    if (document.getElementById(fieldId)) {
      document.getElementById(fieldId).focus();
    }
  }
}