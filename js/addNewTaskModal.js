if(typeof main === 'undefined') {
  let main = document.querySelector('main')
}
if(typeof sidebar === 'undefined'){
  let sidebar = document.getElementById('sidebar')
}

let modal


class addNewTaskModal {
  constructor() {
    this.is_open = false
    this.openNewTaskModalBtn = document.getElementById('openNewTaskModal')

    this.modal = document.getElementById('addNewTaskModal')

    this.title = this.modal.querySelector('.settings').querySelector('input[name="title"]')
    this.description = this.modal.querySelector('.settings').querySelector('textarea[name=description]')
    this.location = this.modal.querySelector('.settings').querySelector('input[name="location"]')

    this.category = this.modal.querySelector('select[name=category]')
    this.due_date = this.modal.querySelector('input[name=due-date]')
    this.due_time = this.modal.querySelector('input[name=due-time]')
    this.duration = this.modal.querySelector('input[name=duration]')
    this.priority = this.modal.querySelector('select[name=priority]')

    this.save_button = this.modal.querySelector('.save').querySelector('button[name=save]')
    this.save_and_start_button = this.modal.querySelector('.save').querySelector('button[name=save-and-start]')

    this.closeButton = document.getElementById('closeAddNewTaskModal')

    this.registerEventListeners()

    if(config.debug)
      console.log(this.modal.querySelector('input[name=due-date]'))
  }

  registerEventListeners = () => {
    this.save_and_start_button.addEventListener("click", () => {
      this.save(true)
    })

    this.save_button.addEventListener("click", () => {
      this.save()
    })

    this.openNewTaskModalBtn.addEventListener("click", () => {
      this.open()
    })

    this.category.addEventListener("change", () => {
      this.setHeaderColor()
    })

    this.closeButton.addEventListener("click", () => {
      this.close()
    })

    this.title.addEventListener("keypress", (e) => {
      if(e.key === 'Enter') {
        this.save()
      } else {
        let cat = getCategorySuggestionByName(this.title.value+e.key)
        console.log("Auto-Cat-Suggestion:",cat)
        if(this.category.value !== cat) {
          this.category.value = cat
          this.setHeaderColor()
        }
      }
    })

    document.addEventListener("keydown", async function(e){
      if(e.key === 'n' && e.altKey) {
        console.log("whoop!", e.key, e)
        e.preventDefault();
        // await this.open()
      }

      if(e.key === "Escape") {
        modal.close()
        e.preventDefault();
        window.location.reload(true)
      }
    });

    document.addEventListener("keydown", async (e) => {
      if(e.ctrlKey && e.keyCode === 13) {
        console.log("ctrl+enter")
        if(this.is_open) {
          console.log("is open!")
          await this.save(true)
        }
      }
    });


  }

  open = () => {
    this.is_open = true
    this.modal.classList.remove('disabled')
    main.classList.add('blur-out')
    sidebar.classList.add('blur-out')
    this.fillCategorySelector()
    this.setHeaderColor()
    this.fillPrioritySelector()

    this.due_date.value = (new Date().toISOString().substring(0, 10))
    if(php_date && php_date !== "" && new Date(php_date) > new Date()) {
      this.due_date.value = (new Date(php_date).toISOString().substring(0, 10))
    }

    this.title.focus()
  }

  save = async (autostart=false) => {
    const title = this.title.value
    const description = this.description.value
    const location = this.location.value
    const due_date = this.due_date.value
    const due_time = this.due_time.value
    const duration = this.duration.value
    const priority = this.priority.value
    const category = this.category.value

    const res = await createTask({title, description, due_date, due_time, duration, priority, category, location})
    const new_id = res.result.ID

    if(autostart) {
      await startTimerOnTask(new_id)
    }

    this.reset()
    this.close()
  }

  reset = () => {
    this.due_time.value = ""
    this.duration.value = ""
  }

  close = () => {
    this.is_open = false;
    this.modal.classList.add('disabled')
    main.classList.remove('blur-out')
    sidebar.classList.remove('blur-out')

    window.location.reload(true)
  }

  setHeaderColor = () => {
    let color = "#"+categoryColors.filter(cat => cat.ID === this.category.value)[0].color
    if(color === "#null") {
      color = "#777"
    }
    this.modal.querySelector('.header').style.backgroundColor = color
  }

  fillCategorySelector = () => {
    for(let cat of categoryColors) {
      let opt = document.createElement('option')
      opt.value = cat.ID
      opt.innerText = cat.ID+" - "+cat.Bezeichnung
      this.category.appendChild(opt)
    }
  }

  fillPrioritySelector = () => {
    if(this.priority.childNodes.length === 0) {
      for(let i = 10; i >= 1; i--) {
        let opt = document.createElement('option')
        opt.value = i
        opt.innerText = i
        if(i === 1) {
          opt.innerText = "1 - Niedrig"
        } if(i === 5) {
          opt.innerText = "5 - Normal"
          opt.selected = true
        } if(i === 10) {
          opt.innerText = "10 - Hoch"
        }
        this.priority.appendChild(opt)
      }
    }
  }

}


async function addNewTaskModal_init() {
  modal = new addNewTaskModal()
}

addNewTaskModal_init()
