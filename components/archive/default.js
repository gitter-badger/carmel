/**
 * Created by emanuel on 07/05/15.
 */
'use strict';
$(document).ready(function(){
    var monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    date = new Date();
    var myDate = date.getFullYear() + " - " +  monthNames[date.getMonth()] + " - " + date.getDate();
    $('time').text(myDate);
});