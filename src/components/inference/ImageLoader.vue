<template>
  <div class="flex flex-col">
    <div v-if="hasImg">
      <img :src="image" alt="Error" />
    </div>
    <div class="mt-3">
      <FileUpload mode="basic" name="demo[]" url="/api/upload" accept="image/*" customUpload
        @uploader="encodeImageFileAsURL" :auto="true" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import FileUpload from 'primevue/fileupload';
import { history, setImageData } from "@/state";

const emit = defineEmits(["uploaded"]);

const image = ref();
const hasImg = ref(false);


function encodeImageFileAsURL(element) {
  console.log("Encode img file", element);
  var file = element.files[0];
  var reader = new FileReader();
  reader.onload = e => {
    image.value = e.target?.result ?? "";
    //console.log("IMG", image.value);
  };
  reader.onloadend = function () {
    hasImg.value = true;
    const res = reader.result?.toString() ?? ""
    const encoded = res;
    //console.log('RESULT', encoded);
    setImageData(encoded, history.length + 1);
  }
  reader.readAsDataURL(file);

}
</script>

<style lang="sass">
.p-fileupload-choose
  @apply lighter
</style>