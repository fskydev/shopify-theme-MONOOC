class ClassWatcher {
    constructor(targetNode, classToWatch, classAddedCallback, classRemovedCallback) {
        this.targetNode = targetNode
        this.classToWatch = classToWatch
        this.classAddedCallback = classAddedCallback
        this.classRemovedCallback = classRemovedCallback
        this.observer = null
        this.lastClassState = targetNode.classList.contains(this.classToWatch)

        this.init()
    }

    init() {
        this.observer = new MutationObserver(this.mutationCallback)
        this.observe()
    }

    observe() {
        this.observer.observe(this.targetNode, { attributes: true })
    }

    disconnect() {
        this.observer.disconnect()
    }

    mutationCallback = mutationsList => {
        for(let mutation of mutationsList) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                let currentClassState = mutation.target.classList.contains(this.classToWatch)
                if(this.lastClassState !== currentClassState) {
                    this.lastClassState = currentClassState
                    if(currentClassState) {
                        this.classAddedCallback()
                    }
                    else {
                        this.classRemovedCallback()
                    }
                }
            }
        }
    }
}

/** -------- Box of Selected Products begin -------- */
function getDivPlacement(divID) {
    let element = document.getElementById(divID);
    return element.offsetTop + element.offsetHeight;    
}

const adjustPlacementBoxSelectedProducts = () => {
    let headerPlacement = getDivPlacement('SiteHeader');

    let elsBoxSelectedProducts = document.querySelectorAll("#bxp-bldr-middle-wizard .bxp-step-box");

    for(const element of elsBoxSelectedProducts) {
        if(headerPlacement < 100) 
            element.style.top = (headerPlacement + 20) + "px"
        else
            element.style.top = headerPlacement + "px";
    }
};

adjustPlacementBoxSelectedProducts();

////////////////////////////////////////////////////////////////

function customDeselect(radio) {
    $j(radio).each(function() {
      if ($j(this).attr("data-pre") !== 'true') {
        let sel = $j(this).siblings("label").find("select");
        if ($j(this).siblings("label").find(".bxp-bldr-qty-down").length > 0) {
          let qty = $j(this).attr("data-qty");
          for (var x=0;x<Number(qty);x++) {
            $j(this).siblings("label").find(".bxp-bldr-qty-down").click();
          }
        } else {
          if (sel.length > 0) {
            $j(this).siblings("label").find(".bxp-deselect").click();
          } else {
            if ($j(this).is(':checked')) {
                jQuery(this).siblings("label").find(".bxp-bldr-item_price").click();
            }
          }
        }
      }
    });
}

document.addEventListener('click', (e) => {
    e = e || window.event;
    let target = e.target || e.srcElement;

    if(target.tagName == "DIV"){
        if (target.classList.contains("bxp-summary-container")) {
            console.log(" -------- remove product selected ");
            console.log("clicked element => ", target);

            let elsRemove = target.getElementsByClassName("bxp-thumbnail-remove");
            console.log(" -------- elsRemove => ", elsRemove)
            if (elsRemove.length > 0) {
                elsRemove[0].click();
            } else {
                console.log(" -------- no element to remove");
                let pid = target.getAttribute("pid");//40992103137461;                
                console.log(" -------- pid => ", pid);
                let elInput = $j("#bxp-bldr-wizard_container").find("input[product-id='"+pid+"']")
                console.log(" -------- elInput => ", elInput);
                customDeselect(elInput);
            }
        }
    }
})
/** -------- Box of Selected Products end -------- */

let boxProducts = {};

fetch('/collections/the-gift-box?view=box-builder')
    .then(response => response.json())
    .then(products => {
        boxProducts = products;
    }
);
let customizedJewelryProducts = {};

fetch('/collections/customized-jewelry-the-jewelry?view=box-builder')
    .then(response => response.json())
    .then(products => {
        customizedJewelryProducts = products;
    }
);

const workOnClassAddToSubmitStep = () => {
    console.log(" -------- Added the class, bxp-bldr-current")
    console.log(" -------- customBxpId = ", customBxpId)
    if (customBxpId == undefined) return;

    let bxpSelectionsStr = localStorage.getItem("bxp_selections_" + customBxpId);
    
    if (bxpSelectionsStr != undefined && bxpSelectionsStr.length > 0) {

        let bxpSelections = JSON.parse(bxpSelectionsStr);
        console.log(" -------- bxpSelections => ", bxpSelections);
        
        /** --- Box begin --- */
        let selectedBoxVariant = bxpSelections.find(obj => {
            return obj.step === 0                           //step 0
        })
        if (selectedBoxVariant != undefined) {
            console.log(" -------- boxProducts => ", boxProducts);
            let boxVariantId = selectedBoxVariant.id;

            console.log(" -------- boxVariantId => ", boxVariantId);

            let boxProduct = boxProducts.find(obj => {
                return obj.variant_id == boxVariantId;
            })

            console.log(" -------- boxProduct => ", boxProduct);
            
            let elWrapperTiles = document.querySelector("#custom-bldr-upload-photo-text .wrapper-tiles");
            elWrapperTiles.style.backgroundImage = "url(" + boxProduct.internal_image + ")";
        }
        /** --- Customized Box end --- */

        /** --- Customized Jewelry begin --- */
        
        let selectedGifts = bxpSelections.filter(obj => {
            return obj.step === 1                          //step 1
        })
        console.log(" -------- selectedGifts (arr) => ", selectedGifts);
        let elWrapperCustomizedJewelry = document.querySelector("#custom-bldr-upload-photo-text .wrapper-customized-jewelry");

        if (selectedGifts.length > 0) {
            console.log(" -------- customizedJewelryProducts => ", customizedJewelryProducts);
            let countSelectedCJProducts = 0;
            
            elWrapperCustomizedJewelry.classList.remove("active");
            elWrapperCustomizedJewelry.querySelectorAll(".customized-jewelry-content.active").forEach(element => {
                element.remove();
            });

            for(const selectedGift of selectedGifts) {
                let giftId = selectedGift.id;
                let jewelry = {};

                if (giftId.indexOf("input_") > -1) {
                    let giftProductId = Number(giftId.substring(6));
                    console.log(" -------- giftProductId => ", giftProductId);
                    
                    jewelry = customizedJewelryProducts.find(obj => {
                        return obj.id == giftProductId;
                    })
                } else {
                    let giftVariantId = giftId;
                    console.log(" -------- giftVariantId => ", giftVariantId);
                    jewelry = customizedJewelryProducts.find(obj => {
                        return obj.variant_id == giftVariantId;
                    })
                }

                console.log(" -------- jewelry => ", jewelry);

                if (jewelry != undefined) {
                    countSelectedCJProducts++;
                    if(countSelectedCJProducts == 1)    elWrapperCustomizedJewelry.classList.add("active");
                    
                    let elTemplateCustomizedJewelry = elWrapperCustomizedJewelry.querySelector(".customized-jewelry-content.template");
                    let elCustomizedJewelryContent = elTemplateCustomizedJewelry.cloneNode(true);
                    elCustomizedJewelryContent.classList.remove("template");

                    elCustomizedJewelryContent.classList.add("active");
                    elCustomizedJewelryContent.classList.add("customized-jewelry-" + countSelectedCJProducts);
                    
                    elCustomizedJewelryContent.dataset.customizedJewelryIndex = countSelectedCJProducts;        //data-customized-jewelry-index
                    
                    ///////////////////////////////
                    let elCustomizedJewelryImg = elCustomizedJewelryContent.querySelector(".product-info > img");
                    elCustomizedJewelryImg.src = jewelry.featured_image;
                    let elCustomizedJewelryTitle = elCustomizedJewelryContent.querySelector(".product-info > div > h3");
                    elCustomizedJewelryTitle.innerText = jewelry.title;

                    elWrapperCustomizedJewelry.append(elCustomizedJewelryContent);
                    
                }
            }
        } else {
            // elWrapperCustomizedJewelry.classList.remove("active");
        }

        /** --- Customized Jewelry end --- */

        /** --- GiftCard Text start --- */
        let elWrapperAttrGiftcardText = document.querySelector("#custom-bldr-upload-photo-text .wrapper-giftcard-attr_text");
        let elWrapperAttrGiftcardFrom = document.querySelector("#custom-bldr-upload-photo-text .wrapper-giftcard-attr_from");
        let elWrapperAttrGiftcardDeliveryTo = document.querySelector("#custom-bldr-upload-photo-text .wrapper-giftcard-attr_delivery_to");
        
        let elAttrGiftcardText = document.querySelector('textarea[name="attr_giftcard_text"]');
        elAttrGiftcardText.setAttribute("attribute", "Message");
        elWrapperAttrGiftcardText.append(elAttrGiftcardText);
        
        let elAttrGiftcardFrom = document.querySelector('input[name="attr_giftcard_from"]');
        elAttrGiftcardFrom.setAttribute("attribute", "From");
        elWrapperAttrGiftcardFrom.prepend(elAttrGiftcardFrom);

        let elAttrGiftcardDeliveryTo = document.querySelector('input[name="attr_giftcard_delivery_to"]');
        elAttrGiftcardDeliveryTo.setAttribute("attribute", "Delivery to");
        elWrapperAttrGiftcardDeliveryTo.prepend(elAttrGiftcardDeliveryTo);

        /** --- GiftCard Text start --- */
    }
}

const workOnClassRemovalToSubmitStep = () => {
    console.log(" --------- Removed the class, bxp-bldr-current")
}

const updateCustomBoxPhoto = (file, i) => {
    let elCustomPhoto = document.querySelector(".box-custom.photo-" + i);
    if (file) {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.addEventListener("load", function () {
            elCustomPhoto.innerHTML = '<img src="' + this.result + '" />';
        });
    } else {
        elCustomPhoto.innerHTML = '';
    }
}

const initBoxCustomPhotos = () => {
    const cntBCPhotos = 3;
    for (let i = 1; i <= cntBCPhotos; i++) {
        let elBoxCustomPhoto = document.querySelector("input[name='properties[box_custom_photo_" + i + "]']");
        elBoxCustomPhoto.setAttribute('id', "properties-box_custom_photo_" + i);
        elBoxCustomPhoto.setAttribute('name', "properties[Photo " + i + " for Box Design]");
        elBoxCustomPhoto.orderBox = i;
        elBoxCustomPhoto.addEventListener('change', (e) => {
            e = e || window.event;
            let element  = e.target || e.srcElement;
            const singleFile = element.files[0];    
            updateCustomBoxPhoto(singleFile, element.orderBox);
        }, false);
    }
}

const updateCustomizedJewelryPhoto = (file, i) => {
    let elCustomPhoto = document.querySelector(".customized-jewelry-content.customized-jewelry-" + i + " .product-info .upload-photo");
    
    if (file) {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.addEventListener("load", function () {
            elCustomPhoto.innerHTML = '<img src="' + this.result + '" />';
            let elProductName = document.createElement('span')
            elProductName.innerHTML = elCustomPhoto.parentNode.querySelector("h3").innerHTML;
            elProductName.style.textTransform = "lowercase";
            
            let elCJPhoto = document.getElementById("properties-customized_jewelry_photo_" + i);
            elCJPhoto.setAttribute("name", "properties[Photo for " + elProductName.innerText + "]");
        });
    } else {
        elCustomPhoto.innerHTML = "<span>Click to Upload Photo</span>";
    }
}

const initCustomizedJewelryPhotos = () => {
    const maxCustomizedJewelries = 5;
    for (let i = 1; i <= maxCustomizedJewelries; i++) {
        let elCJPhoto = document.querySelector("input[name='properties[customized_jewelry_photo_" + i +"]']");
        elCJPhoto.setAttribute('id', "properties-customized_jewelry_photo_" + i);                   // to use id instead of name
        elCJPhoto.orderCustomizedJewelry = i;
        elCJPhoto.addEventListener('change', (e) => {
            e = e || window.event;
            let element  = e.target || e.srcElement;
            let singleFile = element.files[0];
            updateCustomizedJewelryPhoto(singleFile, element.orderCustomizedJewelry);               
        }, false);
    }
}

const putNextBtnInTop = () => {
    let elBldrBottomWizard = document.getElementById("bxp-bldr-bottom-wizard");
    if(elBldrBottomWizard == undefined) {
        console.log(" --------- no steps panel")
        return;
    } else {
        console.log(" ---------  steps panel")
    }

    let elBxpProgress = document.getElementById("bxp-progress");
    elBxpProgress.appendChild(elBldrBottomWizard);

    elBldrBottomWizard.style.position = "relative";
    elBldrBottomWizard.style.borderTop = "none";
    elBldrBottomWizard.style.backgroundColor = "unset";

    let elSiteHeader = document.getElementById("SiteHeader");
    elSiteHeader.appendChild(elBxpProgress);
    elBxpProgress.style.margin = "auto";
    elBxpProgress.style.marginTop = "20px";
    elBxpProgress.style.maxWidth = "960px";
}

const initCustomUploadPhotoText = () => {
    let elsBldrSubmit = document.getElementsByClassName("bxp-bldr-submit bxp-bldr-wizard-step");
    if(elsBldrSubmit.length == 0)
        return;

    let elBldrSubmit = elsBldrSubmit[0];

    let elCustomUploadPhotoText = document.getElementById("custom-bldr-upload-photo-text");
    let elBldrSubmitContent = elBldrSubmit.querySelector(".bxp-step-content");
    elBldrSubmitContent.prepend(elCustomUploadPhotoText);

    return elBldrSubmit;
}

const initCustomizeSteps = () => {
    initBoxCustomPhotos();
    initCustomizedJewelryPhotos();
    //     putNextBtnInTop();
    let elBldrSubmit = initCustomUploadPhotoText();
    let classWatcher = new ClassWatcher(elBldrSubmit, 'bxp-bldr-current', workOnClassAddToSubmitStep, workOnClassRemovalToSubmitStep);    
}

initCustomizeSteps();

const openChooseFile = (index) => {
    console.log(" -------- index => ", index);

    // properties-box_custom_photo_
    // const elBCPhoto = document.querySelector("input[name='properties[box_custom_photo_" + index + "]']");
    const elBCPhoto = document.getElementById("properties-box_custom_photo_" + index);    
    elBCPhoto.click();
}

const openChooseCustomizedJewelryPhoto = (el) => {
    console.log(" -------- element ( - openChooseCustomizedJewelryPhoto - ) => ", el)
    const index = el.parentNode.parentNode.parentNode.dataset.customizedJewelryIndex;
    console.log(" -------- index => ", index);

    // const elCJPhoto = document.querySelector("input[name='properties[customized_jewelry_photo]']");
    // elCJPhoto.click();
    const elCJPhoto = document.getElementById("properties-customized_jewelry_photo_" + index);
    elCJPhoto.click();    
}

let elAttrGiftcardText = document.querySelector('textarea[name="attr_giftcard_text"]');
elAttrGiftcardText.addEventListener('keyup', (e) => {
    e = e || window.event;
    let element  = e.target || e.srcElement;
    console.log(" -------- counter working ---");
    console.log(element.value)

    let countField = document.getElementById("counter-field");
    if ( element.value.length > 110 ) {
        element.value = element.value.substring( 0, 110 );
        
    } else {
        countField.innerText = 110 - element.value.length;
    }
}, false);

document.addEventListener('click', (e) => {
    e = e || window.event;
    let target = e.target || e.srcElement;

    if(target.tagName == "DIV"){
        if (target.classList.contains("bxp-summary-container")) {
            console.log(" -------- remove product selected ");
            console.log("clicked element => ", target);

            let elsRemove = target.getElementsByClassName("bxp-thumbnail-remove");
            console.log(" -------- elsRemove => ", elsRemove)
            if (elsRemove.length > 0) {
                elsRemove[0].click();
            } else {
                console.log(" -------- no element to remove");
                let pid = target.getAttribute("pid");
                console.log(" -------- pid => ", pid);
                let elInput = $j("#bxp-bldr-wizard_container").find("input[product-id='"+pid+"']")
                console.log(" -------- elInput => ", elInput);
                customDeselect(elInput);
            }
        }
    }
})