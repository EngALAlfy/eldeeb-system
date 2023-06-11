$(function () {

    let socket = io("/project-chat");

    $('#inputMessage').on('keyup', function (e) {
        if (e.keyCode === 13) {
            let val = $('#inputMessage').val();
            if (val) {
                if ($('#inputFile').prop('files')[0]) {
                    let fileReader = new FileReader();
                    fileReader.onload = function (e) {
                        doProgress(25);
                        let data = e.target.result;
                        let message = {
                            data: data,
                            id: UUID,
                            message: val,
                            username: username,
                            user_id: userid,
                            user_photo: userphoto,
                            date: Date.now(),
                        };
                        socket.emit('new-message-file', {room:project_id , message:message});
                    };
                    fileReader.readAsDataURL($('#inputFile').prop('files')[0]);
                    $('#inputMessage').val('');
                    $('#inputFileName').hide();
                    $('#inputFile').val('');
                } else {
                    let message = {
                        id: UUID,
                        message: val,
                        username: username,
                        user_id: userid,
                        user_photo: userphoto,
                        date: Date.now(),
                    };
                    socket.emit('new-message', {room:project_id , messageJson:message});
                    $('#inputMessage').val('');
                }
            }
        }
    });

    socket.on('connect', function () {
        socket.emit('join' , project_id);
        socket.emit('get-messages', {room: project_id});
    });

    socket.on('receive-all-messages', function (messages) {
        console.log(messages.length);
        $('#msg_history').empty();
        for (let key in messages) {
            parseMessage(messages[key]);
        }
        let activeTab = localStorage.getItem('activeTab');
        if (activeTab === '#chat') {
            $("html, body").animate({scrollTop: 200 * messages.length}, 1000);
            createPDFThumbnails();
        }
    });

    socket.on('progress' , function (percent) {
        doProgress(percent);
    });

    function doProgress(percent) {
        $('#progress-chat-file').attr('aria-valuenow' , percent).css('width' , percent+'%');
        if(percent === '100'){
            $('#progress-chat-file-container').hide();
            $('#progress-chat-file').attr('aria-valuenow' , 0).css('width' , 0+'%');
        }
    }

    socket.on('receive-message', function (messageJson) {
        parseMessage(messageJson);
        let activeTab = localStorage.getItem('activeTab');
        if (activeTab === '#chat') {
            $("html, body").animate({scrollTop: $("html, body")[0].scrollHeight}, 1000);
            createPDFThumbnails();
        }
        //$("html, body")[0].scrollTop = $("html, body")[0].scrollHeight;
    });

    function parseMessage(messageJson) {
        const event = new Date(messageJson.date);

        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour12: true,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        };

        if (messageJson.user_id === userid) {
            // me
            let html_message = '<div class="outgoing_msg">' +
                '<div class="sent_msg">';

            if (messageJson.file) {
                html_message += checkFileType(messageJson);
            }

            html_message += '            <p>' + messageJson.message +
                '            </p><span class="time_date">' + event.toLocaleDateString('en-US', options) + '</span>' +
                '</div>' +
                '</div>';
            $('#msg_history').append(html_message);
        } else {
            // other
            let html_message = '<div class="incoming_msg mt-3">' +
                '    <div class="incoming_msg_img"><img class="rounded-circle" src="/images/uploads/' + messageJson.user_photo + '" /></div>\n' +
                '    <div class="received_msg">' +
                '        <p style="margin-bottom: 0 !important;" >' + messageJson.username + '</p>   ' +
                '        <div class="received_withd_msg">';

            if (messageJson.file) {
                html_message += checkFileType(messageJson);
            }

            html_message += '            <p>' + messageJson.message +
                '            </p><span class="time_date">' + event.toLocaleDateString('en-US', options) + '</span></div>' +
                '    </div>' +
                '</div>';
            $('#msg_history').append(html_message);
        }
    }

    function checkFileType(messageJson) {
        let htmlFiles = {
            image: '<img src="/chats/images/' + project_id + '/' + messageJson.file + '" class="img-fluid rounded" >',
            pdf: '<img src="/images/pdf.png" data-pdf-thumbnail-file="/chats/docs/' + project_id + '/' + messageJson.file + '" class="img-fluid rounded" ><a style="width: 100%;" download="' + messageJson.file + '" href="/images/uploads/chats/' + project_id + '/' + messageJson.file + '" type="button" class="btn btn-success">Download : ' + messageJson.file + '</a>'
        };
        if (messageJson.type.match(/(jpg|jpeg|png|gif)/)) {
            return htmlFiles.image;
        } else if (messageJson.type.match(/(pdf)/)) {
            return htmlFiles.pdf;
        }

    }
});