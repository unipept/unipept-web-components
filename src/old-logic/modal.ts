import $ from "jquery";

function showInfoModal(title: string, content: string, options: {wide: boolean} = { wide: false }) {
    if (options.wide) {
        $("#info-modal .modal-dialog").addClass("modal-lg");
    }
    const $title = $("#info-modal .modal-title");
    const $body = $("#info-modal .modal-body");
    const $content = $("<p></p>").append(content);
    $title.empty().append(title);
    $body
        .empty()
        .append($content);
    //@ts-ignore
    $("#info-modal").modal("show");
    return $("#info-modal");
}

export { showInfoModal };
