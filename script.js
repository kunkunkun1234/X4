(function () {
    $("#Vocabulary .multiple-text-box").hide();
    $("#SpeakOutLoud .multiple-text-box").hide();

    $(".custom-select.vocabulary").change(function () {
        updateDisplayedStatus("#Vocabulary", $(this).children("option:selected").val());
    });

    $(".custom-select.speak-out-loud").change(function () {
        updateDisplayedStatus("#SpeakOutLoud", $(this).children("option:selected").val());
    });

    function updateDisplayedStatus(id, selectedType) {
        if (selectedType === "single") {
            $(id + " .single-text-box").show();
            $(id + " .multiple-text-box").hide();
        } else {
            $(id + " .single-text-box").hide();
            $(id + " .multiple-text-box").show();
        }
    }

    $("#TableBody").empty();
    $("#TableBody").append(localStorage.getItem("__tableData"));
})();

var CommonModule = (function () {
    const translateApiUrl = "https://translate.yandex.net/api/v1.5/tr.json/translate";
    function CopyText(id) {
        let value = $("#" + id).text();
        $("#TxtCopyText").val(value.replace(/<br>/g,"<br>\r"));
        var copyText = document.getElementById("TxtCopyText");
        copyText.select();
        copyText.setSelectionRange(0, 99999)
        document.execCommand("copy");
    }

    function Translate(word, callback) {
        var request = {
            key: "trnsl.1.1.20190203T174225Z.dbeba85f7ff02573.458339f0f0a64e1f7d491b846e859d84ca3025f8",
            text: word,
            lang: "en-vi"
        }

        console.log(request);
        $.get(translateApiUrl, request)
            .done(function (data) {
                callback(data);
            })
            .fail(function (data) {
                console.error(data);
            })
    }

    return {
        copy: CopyText,
        translate: Translate
    }
})();


var TableModule = (function (commonModule) {
    var orderNumber = 1;
    var vocabIndex = 0;

    function GenerateTableFunc() {
        let hasBr = $("#cbHasBr").val() || false;
        let hasVideo = $("#cbHasVideo").val() || false;
        let html = GenerateIntroduction($("#TopicNameEn").val(), $("#TopicNameVi").val());
        html += GenerateObjectives($("#Sound").val());
        html += GenerateWarmUp(hasVideo, hasBr);
        html += GenerateFreeTalk($("#FreeTalkContext").val());
        html += GenerateDialouge(hasBr);
        html += GenerateVocabulary(hasBr);
        html += GenerateSpeakOutLoud(hasBr);
        html += GenerateConversation(hasBr);
        $("#TableBody").empty();
        $("#TableBody").append(html);
        localStorage.setItem("__tableData", html);
        _updateVocab();
    };

    function GenerateIntroduction(topicNameEn, topicNameVi) {
        var listContent = [
            `Chào anh chị, em là Hùng - trợ giảng của lớp mình ngày hôm nay. 
            Trong buổi học nếu mọi người có câu hỏi gì có thể hỏi em nhé ạ, em sẽ cô gắng giải đáp. 
            Chúc anh chị học tốt.`,
            `Hi, teacher. l'm a teaching assistant for this class today. 
            lf you need any help, please let me know.`,
            `Ngữ cảnh của bài học hôm nay là: ${topicNameEn} (${topicNameVi})`
        ];

        return _generateHtml("Introduction", listContent);
    };

    function GenerateObjectives(sound) {
        let patt1 = /[a-z]/g;
        let result = sound.match(patt1);
        let sound1 = result ? result[0] : "",
            sound2 = result ? result[1] : "";

        let listContent = [
            `SAU BUỔI HỌC NGÀY HÔM NAY, ANH CHI SẼ:\n
            - CÓ THỂ DỄ DÀNG NÓI CHUYỆN VỀ CHỦ ĐỀ NGÀY HÔM NAY\n
            - NHẬN BIẾT ĐƯỢC NHỮNG LỖI PHÁT ÂM THƯỜNG GẶP VẢ HỌC CÁCH PHÁT ÂM /${sound1}/ và /${sound2}/ MỘT CÁCH CHÍNH XÁC\n
            - BIẾT THÊM NHỮNG TỪ MỚI LIÊN QUAN ĐẾN CHỦ ĐỀ NGÀY HÔM NAY`
        ];
        return _generateHtml("Objective", listContent);
    };

    function GenerateWarmUp(hasVideo, hasBr) {
        let listContent = [
            `Đề khởi động bài học ngày hôm nay, anh/chị hãy ${hasVideo ? "xem video và" : ""} trả lời các câu hỏi sau:\n ${hasBr ? "<br>" : ""}`,
        ];

        $("#ListWarmUpQuestion .container-custom").each(function (index) {
            listContent.push(`${$(this).children(".en").val()} (${$(this).children(".vi").val()}) ${hasBr ? "<br>" : ""}`);
        });

        return _generateHtml("Warm up", listContent);
    };

    function GenerateFreeTalk(context) {
        listContent = [
            `Tiếp theo trong phân Free-talk, anh chị sẽ vào vai và thực hành với bạn cùng lớp:\n
            Student A: ${context}\n
            Student B: Bạn là bạn của A, hãy nói chuyện với A`,
        ]
        return _generateHtml("Free talk", listContent)
    }

    function GenerateDialouge(hasBr) {
        let listContent = [
            `Trong phần này anh chị sẽ được học một số từ và mẫu câu hữu ích sau: ${hasBr ? "<br>" : ""}`,
        ];

        $("#ListDialougeSentence .container-custom").each(function (index) {
            listContent.push(`${$(this).children(".en").val()} (${$(this).children(".vi").val()}) ${hasBr ? "<br>" : ""}`);
        });

        return _generateHtml("Dialouge", listContent);
    };

    function GenerateVocabulary(hasBr) {
        let listContent = [
            `Dưới đây là những từ mới trong đoạn hội thoại vừa rồi: ${hasBr ? "<br>" : ""}`,
        ];

        let selectedType = $(".custom-select.vocabulary").children("option:selected").val();
        if (selectedType === "single") {
            let listWords = $("#Vocabulary textarea").val();
            listWords = listWords.replace(/\n/g, '<br/>');
            listContent.push(listWords);
        } else {
            $("#Vocabulary .multiple-text-box .container-custom").each(function (index) {
                listContent.push(`${$(this).children(".en").val()}: ${$(this).children(".vi").val()} ${hasBr ? "<br>" : ""}`);
            });
        }
        return _generateHtml("Vocabulary", listContent)
    }

    function GenerateSpeakOutLoud(hasBr) {
        let listContent = [
            `Trong phần Speak Out Loud, anh chị sẽ đọc tất cả các từ trên slide. ${hasBr ? "&lt;br&gt;" : ""}`
        ];
        let selectedType = $(".custom-select.speak-out-loud").children("option:selected").val();
        if (selectedType === "single") {
            listContent.push("loading...");
            vocabIndex = orderNumber + 1;
        } else {
            $("#SpeakOutLoud .multiple-text-box .container-custom").each(function (index) {
                listContent.push(`${$(this).children(".en").val()}: ${$(this).children(".vi").val()} ${hasBr ? "&lt;br&gt;" : ""}`);
            });
        }
        return _generateHtml("Speak Out Loud", listContent);
    }

    function GenerateConversation(hasBr) {
        let listContent = [
            `Ở phần tiếp theo này, anh chị sẽ chọn một bối cảnh và thực hành nói chuyện với giáo viên về bối cảnh đó:`
        ];

        listContent.push(`Chủ đề: ${$("#ConversationTopic .container-custom").children(".en").val()}: ${$("#ConversationTopic .container-custom").children(".vi").val()} ${hasBr ? "<br>" : ""}`);

        $("#ConversationContext .container-custom").each(function (index) {
            listContent.push(`Bối cảnh ${index + 1}: ${$(this).children(".en").val()} (${$(this).children(".vi").val()}) ${hasBr ? "<br>" : ""}`);
        });

        $("#ConversationSuggestion .container-custom").each(function (index) {
            listContent.push(`Gợi ý ${index + 1}: ${$(this).children(".en").val()} (${$(this).children(".vi").val()}) ${hasBr ? "<br>" : ""}`);
        });
        return _generateHtml("Conversation", listContent);
    }

    function _generateHtml(part, listContent) {
        let output = `
        <tr>
            <td rowspan="${listContent.length}">${part}</td>
            <td id="content${orderNumber}">${listContent[0]}</td>
            <td>
                <button type="button" class="btn btn-primary" onclick="CommonModule.copy('content${orderNumber}')">Copy</button>
            </td>
        </tr>`;
        orderNumber++;

        for (let i = 1; i < listContent.length; i++) {
            output += `
            <tr>
                <td id="content${orderNumber}">${listContent[i]}</td>
                <td>
                    <button type="button" class="btn btn-primary" onclick="CommonModule.copy('content${orderNumber}')">Copy</button>
                </td>
            </tr>`;
            orderNumber++;
        }
        return output;
    }

    function _updateVocab() {
        console.log($("#SpeakOutLoud textarea").val());
        let output = "";
        let listWords = $("#SpeakOutLoud textarea").val().split(/\s/g);
        for (let i = 0; i < listWords.length; i++) {
            if (!listWords[i])
                continue;

            CommonModule.translate(listWords[i], function (data) {
                output += `${listWords[i]}: ${data.text[0]} &lt;br&gt; <br>`;
            });
        }

        setTimeout(function () {
            console.log("here");
            $("#content" + vocabIndex).empty();
            $("#content" + vocabIndex).append(output);
        }, 3000);
    }

    return {
        generateTable: GenerateTableFunc
    }
})(CommonModule);