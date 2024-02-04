export function moveElement(
  parentInitial,
  elementInitial,
  secondaryElementInitial,
  parentFinal,
  activateWidth = null
) {
  let initialParentElement = document.querySelector(`.${parentInitial}`);
  let initialElement = initialParentElement.querySelector(`.${elementInitial}`);
  let initialElementSecondary = false;
  if (secondaryElementInitial != "" && secondaryElementInitial != undefined) {
    initialElementSecondary = initialParentElement.querySelector(
      `.${secondaryElementInitial}`
    );
  }

  let finalParent = document.querySelector(`.${parentFinal}`);

  if (activateWidth) {
    let screenWidth = window.innerWidth;
    if (screenWidth <= activateWidth) {
      // console.log(
      //   initialParentElement,
      //   initialElement,
      //   initialElementSecondary,
      //   finalParent
      // );

      initialElement.remove();
      finalParent.appendChild(initialElement);
    } else if (screenWidth > activateWidth) {
      if (!initialParentElement.querySelector(`.${elementInitial}`)) {
        initialElement.remove();
        initialParentElement.insertBefore(
          initialElement,
          initialElementSecondary
        );
      }
    }

    window.addEventListener("resize", function () {
      let screenWidth = window.innerWidth;
      if (screenWidth <= activateWidth) {
        initialElement.remove();
        finalParent.appendChild(initialElement);
      } else if (screenWidth > activateWidth) {
        if (initialParentElement.querySelector(`.${elementInitial}`)) {
          initialElement.remove();
          if (initialElementSecondary) {
            initialParentElement.insertBefore(
              initialElement,
              initialElementSecondary
            );
          } else {
            initialParentElement.appendChild(initialElement);
          }
        }
      }
    });
  } else {
    initialElement.remove();
    finalParent.appendChild(initialElement);
  }
}
