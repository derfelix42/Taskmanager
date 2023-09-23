const app = Vue.createApp({})

app.component('save-button', {
  props: {
    msg: {
      type: String,
      default: "Speichern"
    }
  },
  template: `
    <button type="button" name="save" @click="$emit('save')">{{msg}}</button>
  `
})

app.component('modal-input', {
  props: {
    label: String,
    type: { // date, time, datetime, text, select
      type: String,
    }
  },
  computed: {
    multiInput() {
      return this.type === "datetime"
    },
    typeOne() {
      if(this.type !== "datetime") {
        return this.type
      } else {
        return "date"
      }
    },
    typeTwo() {
      if(this.type === "datetime") {
        return "time"
      }
    }
  },
  template: `<label>{{label}}: <input class="margin-left" :type="typeOne" name="due-date"><input v-if="multiInput" class="margin-left" :type="typeTwo" name="due-time"></label>`
})


app.component('modal-section', {
  props: [
    "type"
  ],
  template: `
    <div :class="type">
      <slot></slot>
    </div>
  `

})

app.component('mymodal', {
  data() {
    return {
      enabled: true,
      title: "Add WakeupTime"
    }
  },
  template: `
      <div id="" class="taskModal" v-bind:class="{enabled: enabled}">
        <div class="header">
          {{title}}
          <p id="closeAddNewTaskModal" class="float-right">[X]</p>
        </div>
        <div class="main">
          <modal-section type="settings">
            <input class="bigInput" type="text" name="title" placeholder="Title" required>
            <textarea class="" name="description" rows="8" cols="80" placeholder="Description"></textarea>
            <modal-input label="test" type="datetime"></modal-input>
          </modal-section>
          <hr>
          <modal-section type="save">
            <save-button msg="Hinzufügen"></save-button>
          </modal-section>
        </div>
      </div>

    `
})


//app.mount('#components-demo')



// <hr>
// <div class="settings">
//   <label>Category: <select class="mobilBigInput" name="category"></select></label>
//   <label>Priority: <select class="mobilBigInput" name="priority"></select></label>
// </div>
// <hr>
// <div class="settings">
//   <label>Deadline: <input class="margin-left" type="date" name="due-date"><input class="margin-left" type="time" name="due-time"></label>
//   <label>Duration: <input class="margin-left" type="time" name="duration"></label>
// </div>
// <hr>
// <div class="save">
//   <button type="button" name="save">Speichern</button>
// </div>
