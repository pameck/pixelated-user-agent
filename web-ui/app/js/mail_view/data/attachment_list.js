/*
 * Copyright (c) 2015 ThoughtWorks, Inc.
 *
 * Pixelated is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pixelated is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pixelated. If not, see <http://www.gnu.org/licenses/>.
 */

define(
    [
        'flight/lib/component',
        'page/events'
    ],

    function (defineComponent, events) {
        'use strict';

        function attachmentList() {
            this.defaultAttrs({
                inputFileUpload: '#fileupload',
                attachmentListItem: '#attachment-list-item',
                progressBar: '#progress .progress-bar',
                attachmentBaseUrl: '/attachment',
                attachments: []
            });

            this.addAttachment = function (event, data) {
                this.attr.attachments.push(data);
                this.renderAttachmentListView(data);
            };

            this.renderAttachmentListView = function (data) {
                var item = this.buildAttachmentListItem(data);
                this.select('attachmentListItem').html(item);
            };

            function humanReadable(bytes) {
                var e = Math.floor(Math.log(bytes) / Math.log(1024));
                return (bytes / Math.pow(1024, e)).toFixed(2) + ' ' + ' KMGTP'.charAt(e) + 'b';
            }

            this.buildAttachmentListItem = function (data) {
                return '<a href="' + this.attr.attachmentBaseUrl + '/' + data.attachment_id + '?filename=' +
                    data.filename + '&encoding=base64">' + data.filename + ' (' + humanReadable(data.filesize) + ')' +
                    '</a>';
            };

            function addJqueryFileUploadConfig(self) {
                self.select('inputFileUpload').fileupload({
                    url: self.attr.attachmentBaseUrl,
                    dataType: 'json',
                    done: function (e, response) {
                        var data = response.result;
                        self.trigger(document, events.mail.uploadedAttachment, data);
                    },
                    progressall: function (e, data) {
                        var progressRate = parseInt(data.loaded / data.total * 100, 10);
                        self.select('progressBar').css('width', progressRate + '%');
                    }
                }).bind('fileuploadstart', function (e) {
                    self.trigger(document, events.mail.uploadingAttachment);
                }).bind('fileuploadadd', function (e) {
                    $('.attachmentsAreaWrap').show();
                });
            }

            this.startUpload = function () {
                addJqueryFileUploadConfig(this);
                this.select('inputFileUpload').click();
            };

            this.after('initialize', function () {
                this.on(document, events.mail.uploadedAttachment, this.addAttachment);
                this.on(document, events.mail.startUploadAttachment, this.startUpload);
            });
        }

        return defineComponent(attachmentList);
    });