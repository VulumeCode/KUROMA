
Array.prototype.clone = function() {
  return this.slice(0);
};

Array.prototype.swap = function (a,b) {
  [this[a],this[b]] = [this[b],this[a]];
}

Array.prototype.shuffle = function() {
    for (var i = this.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = this[i];
        this[i] = this[j];
        this[j] = temp;
    }
}






window.devtoolsFormatters = [{
  header: function(obj){
    if (obj instanceof Array){
      return ["div",{}, obj.length + ":" + JSON.stringify(obj)]
    }
    return null;
  },
  hasBody: function(){
    return false;
  }
}]

Math.randomInt = (i) => {
  return Math.floor(Math.random() * i);
}

Math.randomIntBetween = (a,b) => {
  return a + Math.randomInt(b-a);
}
