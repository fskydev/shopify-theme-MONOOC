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

function workOnClassAddToSubmitStep() {
    console.log(" --------- Added the class, bxp-bldr-current")
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
        let selectedGift = bxpSelections.find(obj => {
            return obj.step === 1                           //step 0
        })
        if (selectedGift != undefined) {
            console.log(" -------- customizedJewelryProducts => ", customizedJewelryProducts);
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
            let elWrapperCustomizedJewelry = document.querySelector("#custom-bldr-upload-photo-text .wrapper-customized-jewelry");

            if (jewelry != undefined) {
                console.log(" -------- jewelry inside => ", jewelry);                
                elWrapperCustomizedJewelry.classList.add("active");

                ///////////////////////////////
                let elCustomizedJewelryImg = elWrapperCustomizedJewelry.querySelector(".product-info > img");
                elCustomizedJewelryImg.src = jewelry.featured_image;
                let elCustomizedJewelryTitle = elWrapperCustomizedJewelry.querySelector(".product-info > div > h3");
                elCustomizedJewelryTitle.innerText = jewelry.title;

            } else {
                elWrapperCustomizedJewelry.classList.remove("active");
            }

        }
        /** --- Customized Jewelry end --- */
        /** --- GiftCard Text start --- */
        let elWrapperAttrGiftcardText = document.querySelector("#custom-bldr-upload-photo-text .wrapper-attr_giftcard_text");
        let elAttrGiftcardText = document.querySelector('input[name="attr_giftcard_text"]');
        elWrapperAttrGiftcardText.append(elAttrGiftcardText);

        /** --- GiftCard Text start --- */
    }
}

function workOnClassRemovalToSubmitStep() {
    console.log(" --------- Removed the class, bxp-bldr-current")
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
    // console.log(" -------- elsBldrSubmit => ", elsBldrSubmit);
    // console.log(" -------- elBldrSubmit => ", elBldrSubmit);

    let elCustomUploadPhotoText = document.getElementById("custom-bldr-upload-photo-text");
    let elBldrSubmitContent = elBldrSubmit.querySelector(".bxp-step-content");
    elBldrSubmitContent.prepend(elCustomUploadPhotoText);

    return elBldrSubmit;
}

const initCustomizeSteps = () => {
//     putNextBtnInTop();
    let elBldrSubmit = initCustomUploadPhotoText();

    console.log(" -------- elBldrSubmit => ", elBldrSubmit);

    let classWatcher = new ClassWatcher(elBldrSubmit, 'bxp-bldr-current', workOnClassAddToSubmitStep, workOnClassRemovalToSubmitStep)
    console.log(" -------- classWatcher => ", classWatcher);
    
}

initCustomizeSteps();

const openChooseFile = (index) => {
    console.log(" -------- index => ", index);
    let elBoxCustomPhoto = document.querySelector("input[name='properties[box_custom_photo_" + index + "]']");
    elBoxCustomPhoto.click();
}

const openChooseCustomizedJewelryPhoto = (index) => {
    let elBoxCustomJewelryPhoto = document.querySelector("input[name='properties[customized_jewelry_photo]']");
    elBoxCustomJewelryPhoto.click();
}

let elBoxCustomPhoto1 = document.querySelector("input[name='properties[box_custom_photo_1]']");
let elBoxCustomPhoto2 = document.querySelector("input[name='properties[box_custom_photo_2]']");
let elBoxCustomPhoto3 = document.querySelector("input[name='properties[box_custom_photo_3]']");

let elBoxCustomJewelryPhoto = document.querySelector("input[name='properties[customized_jewelry_photo]']");

elBoxCustomPhoto1.addEventListener('change', function () {
    const singleFile = elBoxCustomPhoto1.files[0];    
    updateCustomBoxPhoto(singleFile, 1);
}, false);
  
elBoxCustomPhoto2.addEventListener('change', function () {
    let singleFile = elBoxCustomPhoto2.files[0];
    updateCustomBoxPhoto(singleFile, 2);
}, false);

elBoxCustomPhoto3.addEventListener('change', function () {
    let singleFile = elBoxCustomPhoto3.files[0];
    updateCustomBoxPhoto(singleFile, 3);
}, false);

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


elBoxCustomJewelryPhoto.addEventListener('change', function () {
    let singleFile = elBoxCustomJewelryPhoto.files[0];
    updateCustomizedJewelryPhoto(singleFile);
}, false);

const updateCustomizedJewelryPhoto = (file) => {
    let elCustomedPhoto = document.querySelector(".customized-jewelry-content .product-info .upload-photo");
    if (file) {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.addEventListener("load", function () {
            elCustomedPhoto.innerHTML = '<img src="' + this.result + '" />';
        });
    } else {
        elCustomedPhoto.innerHTML = "<span>Click to Upload Photo</span>";
    }
}