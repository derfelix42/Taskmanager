// async function setCategorySidebar() {
//     let ul = document.getElementById("categories")
//     // console.log(ul)
//     let cats = await getCategoryColors()
//     let f_cat = cats.filter(c => c.display === "1")
//     // console.log(f_cat)

//     for(let c of f_cat) {
//         if(c.color === null) {
//             c.color = "777"
//         }
//         let elem = createCategoryElement(c.Bezeichnung, c.color, "?category="+c.ID)
//         ul.appendChild(elem)

//         // <a href='?category=$cat_id'><li><div class='categoryIndicator' style='--color: #$color'></div>$cat_bez</li></a>

//         if(c.prefixes !== null) {
//             for(let p of c.prefixes.split(",")) {
//                 // console.log("->",p)
//                 // console.log(p.indexOf(c.Bezeichnung))
//                 if(p.indexOf(c.Bezeichnung) > 0){
//                     continue
//                 }
//                 let prelem = createCategoryElement("> "+p, "", "?category="+c.ID+"&prefix="+p)
//                 ul.append(prelem)
//             }
//         }
//     }

// }

// function createCategoryElement(name, color, url) {
//     let link = document.createElement("a")
//     link.href = url

//     let li = document.createElement("li")
//     let colorbox = document.createElement("div")
//     colorbox.classList.add("categoryIndicator")
//     colorbox.style.cssText  = "--color: #"+color
//     li.innerText = name
//     li.prepend(colorbox)
//     link.appendChild(li)
//     return link
// }


// // setCategorySidebar()