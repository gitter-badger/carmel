var utils = {
  merge: function (first, second, third) {
      var result = {};
      for (var object in first)  { result[object] = first[object];  }
      for (var object in second) { result[object] = second[object]; }
      for (var object in third)  { result[object] = third[object];  }

      return result;
  }
};

module.exports = utils;
