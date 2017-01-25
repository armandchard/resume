(function () {
  'use strict';

  angular
    .module('mbc.core')
    .factory('firebaseStorageService', firebaseStorageService);

  firebaseStorageService.$inject = ['Auth', '$log', '$q'];

  function firebaseStorageService(Auth, $log, $q) {
    var storage = firebase.storage();
    var user = Auth.$getAuth();
    var service = {
      storageRef: storage.ref(),
      storageUser: storage.ref('users/' + user.uid),
      storageUserImages: storage.ref('users/' + user.uid + '/images'),
      storageProducts: storage.ref('products'),
      storageCsv: storage.ref('uploads/csv/' + user.uid),
      storageUploads: storage.ref('uploads/' + user.uid),
      storageImages: storage.ref('uploads/' + user.uid + '/images'),
      csvFileModel: storage.ref('mbctemplate.csv'),
      xlsFileModel: storage.ref('mbctemplate.xlsx'),
      upload: upload,
      deleteFile: deleteFile,
      getFileUrl: getFileUrl
    };
    return service;

    function upload(file, storage, metadata) {
      var deferred = $q.defer();
      metadata = metadata || null;
      var uploadTask;
      if (metadata !== null) {
        uploadTask = storage.child(file.name).put(file, metadata);
      } else {
        uploadTask = storage.child(file.name).put(file);
      }
      // Listen for state changes, errors, and completion of the upload.
      uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
        function (snapshot) {
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          $log.log('Upload is ' + progress + '% done');
          switch (snapshot.state) {
            case firebase.storage.TaskState.PAUSED: // or 'paused'
              $log.log('Upload is paused');
              break;
            case firebase.storage.TaskState.RUNNING: // or 'running'
              $log.log('Upload is running');
              break;
          }
        }, function (error) {
          $log.log(error.code);
          switch (error.code) {
            case 'storage/unauthorized':
              // User doesn't have permission to access the object
              break;
            case 'storage/canceled':
              // User canceled the upload
              break;
            case 'storage/unknown':
              // Unknown error occurred, inspect error.serverResponse
              break;
          }
        }, function () {
          // Upload completed successfully, now we can get the download URL
          deferred.resolve(uploadTask.snapshot.downloadURL);
        });
      return deferred.promise;
    }

    function deleteFile(ref) {
      return ref.delete();
    }

    function getFileUrl(id, filename) {
      var deferred = $q.defer();
      service.storageProducts.child(id).child(filename).getDownloadURL()
        .then(function (url) {
          deferred.resolve({ id: id, url: url });
        })
      return deferred.promise;
    }
  }

})();
