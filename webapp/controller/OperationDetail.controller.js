sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter"
],
    function (BaseController, JSONModel, formatter) {
        "use strict";

        var aContainerFields = [
            {
                id: "order_no",
                control: "sap.m.Text",
                value: "{order_no}",
                name: "order_no",
                enabled: false,
                required: false
            },
            {
                id: "type_txt",
                control: "sap.m.Text",
                value: "{type_txt}",
                name: "type_txt",
                enabled: false,
                required: false
            },
            {
                id: "src_tank",
                control: "sap.m.Select",
                selectedKey: "{src_tank}",
                path: "/xTQAxTANKS_VH",
                value: "{src_tank}",
                key: "{tank}",
                text: "{lgobe} ({tank})",
                name: "src_tank",
                required: true
            },
            {
                id: "dest_tank",
                control: "sap.m.Select",
                selectedKey: "{dest_tank}",
                value: "{dest_tank}",
                path: "/xTQAxTANKS_VH",
                key: "{tank}",
                text: "{lgobe} ({tank})",
                name: "dest_tank",
                required: true
            },
            {
                id: "material_txt",
                control: "sap.m.Text",
                value: "{material_txt}",
                name: "material_txt",
                enabled: false
            },
            {
                id: "quantity",
                control: "sap.m.Text",
                value: "{quantity}",
                name: "quantity",
                required: true
            },
            {
                id: "operation_time",
                control: "sap.m.TimePicker",
                value: "{operation_time}",
                name: "operation_time",
                required: true
            },
            {
                id: "unit",
                control: "sap.m.Text",
                value: "{unit}",
                name: "unit",
                enabled: false,
                required: false
            },
            {
                id: "planned_date",
                control: "sap.m.DatePicker",
                value: "{planned_date}",
                formatter: "true",
                name: "planned_date",
                required: true
            },
            {
                id: "init_date",
                control: "sap.m.DatePicker",
                value: "{init_date}",
                formatter: "true",
                name: "init_date",
                enabled: false,
                required: false
            },
            {
                id: "end_date",
                control: "sap.m.DatePicker",
                value: "{end_date}",
                formatter: "true",
                name: "end_date",
                enabled: false,
                required: false
            },
            {
                id: "status_txt",
                control: "sap.m.Text",
                value: "{status_txt}",
                name: "status_txt",
                enabled: false,
                required: false
            },
        ];

        var aContainerFieldLabels = [
            {
                id: "order_no",
                labelText: "order_no"
            },
            {
                id: "type_txt",
                labelText: "type_txt"
            },
            {
                id: "src_tank",
                labelText: "src_tank"
            },
            {
                id: "dest_tank",
                labelText: "dest_tank"
            },
            {
                id: "material_txt",
                labelText: "material_txt"
            },
            {
                id: "quantity",
                labelText: "quantity"
            },
            {
                id: "operation_time",
                labelText: "operation_time"
            },
            {
                id: "unit",
                labelText: "unit"
            },
            {
                id: "planned_date",
                labelText: "planned_date"
            },
            {
                id: "init_date",
                labelText: "init_date"
            },
            {
                id: "end_date",
                labelText: "end_date"
            },
            {
                id: "status_txt",
                labelText: "status_txt"
            },
        ]

        return BaseController.extend("tanksoperations.controller.OperationDetail", {

            formatter: formatter,

            onInit: function () {
                var oViewModel = new JSONModel({
                    delay: 0,
                    busy: false,
                });

                this.sPath;

                this.setModel(oViewModel, "OperationDetailModel");
                sap.ui.core.UIComponent.getRouterFor(this).getRoute("operationDetail").attachPatternMatched(this.onPatternMatched, this);
            },

            onAfterRendering: function () {
                if (this.getModel("appView").getProperty("/fromLaunchpad")) {
                    var that = this;
                    sessionStorage.setItem("goToLaunchpad", "");
                    window.addEventListener("message", function (event) {
                        var data = event.data;
                        if (data.action == "goToMainPage") {
                            that.onNavBackDetail();
                        }
                    });
                } else {

                }
            },

            onBuildGeneralDataSimpleForm: function (oAction) {
                var oSimpleForm = this.byId("GeneralInfo");

                oSimpleForm.destroyContent();

                var oToolbar = new sap.m.Toolbar({ ariaLabelledBy: "Title2" });
                oToolbar.addContent(new sap.m.ToolbarSpacer());

                var oConfirmButton = new sap.m.Button({
                    id: "ConfirmButton",
                    text: this.getResourceBundle().getText("confirmEditOperationHeader"),
                    type: sap.m.ButtonType.Emphasized,
                    press: this.onPressConfirmOperationHeaderButton.bind(this)
                });

                var oCancelButton = new sap.m.Button({
                    id: "CancelButton",
                    text: this.getResourceBundle().getText("cancelEditOperationHeader"),
                    press: this.onPressCancelOperationHeaderButton.bind(this)
                });

                var oBtChange = new sap.m.Button({
                    id: "EditButton",
                    text: this.getResourceBundle().getText("editOperationHeader"),
                    press: this.onPressEditOperationHeaderButton.bind(this)
                });

                oConfirmButton.setVisible(oAction !== 1);
                oCancelButton.setVisible(oAction !== 1);
                oBtChange.setVisible(oAction === 1);

                oToolbar.addContent(oConfirmButton);
                oToolbar.addContent(oCancelButton);
                oToolbar.addContent(oBtChange);

                oSimpleForm.addContent(oToolbar);

                var oObject = this.getModel().getObject(this.sPath);

                aContainerFields.forEach(oField => {
                    var showField = true;

                    if (oObject.type === "1") {
                        if (oField.id === "quantity" || oField.id === "dest_tank") {
                            showField = false;
                        } else if (oField.id === "operation_time") {
                            showField = true;
                        }
                    } else if (oObject.type === "2") {
                        if (oField.id === "operation_time") {
                            showField = false;
                        } else if (oField.id === "quantity" || oField.id === "dest_tank") {
                            showField = true;
                        }
                    }

                    if (!showField) {
                        return;
                    }

                    switch (oAction) {
                        case 1:
                            oSimpleForm.addContent(new sap.m.Label({
                                text: this.getResourceBundle().getText(aContainerFieldLabels.find(({ id }) => id === oField.id).labelText)
                            }));

                            switch (oField.control) {
                                case "sap.m.TimePicker":
                                    oSimpleForm.addContent(new sap.m.Text({
                                        id: oField.id,
                                        text: this._convertedTime(oObject.operation_time.ms)
                                    }));
                                    break;

                                case "sap.m.Text":
                                    oSimpleForm.addContent(new sap.m.Text({
                                        id: oField.id,
                                        text: oField.value,
                                    }));
                                    break;

                                case "sap.m.Select":
                                    oSimpleForm.addContent(new sap.m.Text({
                                        id: oField.id,
                                        text: oField.value,
                                    }));
                                    break;

                                case "sap.m.DatePicker":
                                    oSimpleForm.addContent(new sap.m.Text({
                                        id: oField.id,
                                        text: {
                                            path: oField.value.replace("{", "").replace("}", ""),
                                            type: 'sap.ui.model.type.DateTime',
                                            formatOptions: {
                                                style: 'short',
                                                strictParsing: true,
                                                pattern: "dd.MM.yyyy, HH:mm",
                                            }
                                        }
                                    }));
                                    break;
                            }
                            break;

                        case 2:
                            oSimpleForm.addContent(new sap.m.Label({
                                text: this.getResourceBundle().getText(aContainerFieldLabels.find(({ id }) => id === oField.id).labelText)
                            }));

                            switch (oField.control) {
                                case "sap.m.Text":
                                    oSimpleForm.addContent(new sap.m.Input({
                                        id: oField.id,
                                        name: oField.name,
                                        value: oField.value,
                                        required: oField.required,
                                        enabled: oField.enabled
                                    }));

                                    break;

                                case "sap.m.DatePicker":
                                    oSimpleForm.addContent(new sap.m.DateTimePicker({
                                        id: oField.id,
                                        name: oField.name,
                                        showTimezone: true,
                                        showCurrentTimeButton: true,
                                        required: oField.required,
                                        enabled: oField.enabled,
                                        value: {
                                            path: oField.value.replace("{", "").replace("}", ""),
                                            type: 'sap.ui.model.type.DateTime',
                                            formatOptions: {
                                                style: 'short',
                                                strictParsing: true,
                                                pattern: "dd.MM.yyyy, HH:mm"
                                            },
                                            valueFormat: "yyyy-MM-ddPTHH:mm:ssZ"
                                        },
                                    }));
                                    break;

                                case "sap.m.Select":
                                    this.oSelect = new sap.m.Select({
                                        id: oField.id,
                                        name: oField.name,
                                        required: oField.required,
                                        items: {
                                            path: oField.path,
                                            template: new sap.ui.core.ListItem({
                                                key: oField.key,
                                                text: oField.text
                                            }),
                                        },
                                        selectedKey: oField.selectedKey
                                    });

                                    this.oSelect.setModel(this.getModel());
                                    oSimpleForm.addContent(this.oSelect);
                                    break;

                                case "sap.m.TimePicker":
                                    oSimpleForm.addContent(new sap.m.TimePicker({
                                        id: oField.id,
                                        required: oField.required,
                                        value: this._convertedTime(oObject.operation_time.ms),
                                        valueFormat: "PTHH'H'mm'M'ss'S",
                                        displayFormat: "HH:mm:ss"
                                    }));
                                    break;
                            }
                            break;
                    }
                });
            },

            _convertedTime: function (ms) {
                var hours = Math.floor(ms / (1000 * 60 * 60)) % 24,
                    minutes = Math.floor((ms / (1000 * 60)) % 60),
                    seconds = Math.floor((ms / 1000) % 60);

                return hours.toString().padStart(2, '0') + ":" +
                    minutes.toString().padStart(2, '0') + ":" +
                    seconds.toString().padStart(2, '0');
            },

            _getConvertedTimeValue: function () {
                var oTimePickerValue = sap.ui.getCore().byId("operation_time").getValue();

                if (oTimePickerValue && !oTimePickerValue.includes("PT")) {
                    var timeParts = oTimePickerValue.match(/(\d+):(\d+):(\d+)\s(AM|PM)/);
                    if (timeParts) {
                        var hours = parseInt(timeParts[1], 10),
                            minutes = parseInt(timeParts[2], 10),
                            seconds = parseInt(timeParts[3], 10),
                            period = timeParts[4];

                        if (period === 'PM' && hours < 12) {
                            hours += 12;
                        } else if (period === 'AM' && hours === 12) {
                            hours = 0;
                        }

                        var totalMilliseconds = (hours * 60 * 60 + minutes * 60 + seconds) * 1000;

                        return this._convertTime(totalMilliseconds);
                    }
                } else {
                    return oTimePickerValue;
                }
            },

            _convertTime: function (ms) {
                var hours = Math.floor(ms / (1000 * 60 * 60)),
                    minutes = Math.floor((ms / (1000 * 60)) % 60),
                    seconds = Math.floor((ms / 1000) % 60);

                var formattedTime = "PT" +
                    (hours > 0 ? hours + "H" : "") +
                    (minutes > 0 ? minutes + "M" : "") +
                    (seconds > 0 ? seconds + "S" : "");

                return formattedTime || "PT0S";
            },

            onPatternMatched: function (oEvent) {
                this.onBindViewDetail("/" + oEvent.getParameter("config").pattern.replace("/{objectId}", "") + oEvent.getParameter("arguments").objectId);
            },

            onBindViewDetail: function (sObjectPath, bForceRefresh) {
                this.sPath = sObjectPath;

                this.getView().bindElement({
                    path: sObjectPath,
                    change: this.onBindingChange.bind(this),
                    events: {
                        dataRequested: function () {
                            this.getModel("appView").setProperty("/busy", true);
                        }.bind(this),
                        dataReceived: function () {
                            this.getModel("appView").setProperty("/busy", false);
                            this.onBuildGeneralDataSimpleForm(1);
                        }.bind(this)
                    }
                });

                if (bForceRefresh) {
                    this.getView().getModel().refresh();
                }
            },

            onNavBackDetail: function (oEvent) {
                sessionStorage.setItem("goToLaunchpad", "X");
                var that = this,
                    oOperation = this.getModel().getObject(this.getView().getBindingContext().getPath()),
                    sEdited = this.onValidateEditedFieldsHeader("GeneralInfo", oOperation);

                if (sEdited) {
                    new sap.m.MessageBox.warning(this.getResourceBundle().getText("editOperationHeaderDataText"), {
                        title: this.getResourceBundle().getText("editOperationHeaderDataTitle"),
                        actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                        emphasizedAction: sap.m.MessageBox.Action.OK,
                        onClose: function (oAction) {
                            if (oAction === sap.m.MessageBox.Action.OK) {
                                that.onBuildGeneralDataSimpleForm(1);
                                that.onNavigation("", "RouteMain", "");
                            }
                        }
                    });
                } else {
                    this.onNavigation("", "RouteMain", "");
                }
            },

            onPressConfirmOperationHeaderButton: function () {
                var oOperation = this.getModel().getObject(this.getView().getBindingContext().getPath()),
                    sEdited = this.onValidateEditedFields("GeneralInfo", oOperation);
                if (sEdited) {
                    var aControls = [sap.m.Input, sap.m.Select, sap.m.DatePicker],
                        aContainers = ["GeneralInfo"],
                        oMainControl = "";

                    var oChecked = this.checkEmptyFields(aControls, aContainers, oMainControl);

                    if (oChecked) {
                        var sPath = this.getView().getBindingContext().getPath(),
                            oOperation = this.getModel().getObject(sPath),
                            oURLParams = new URLSearchParams(window.location.search),
                            oToken = oURLParams.get('token'),
                            oEntry = {
                                type: oOperation.type,
                                src_tank: sap.ui.getCore().byId("src_tank").getSelectedKey(),
                                planned_date: sap.ui.getCore().byId("planned_date").getDateValue(),
                            };

                        if (oOperation.type == '1') {
                            oEntry.dest_tank = sap.ui.getCore().byId("src_tank").getSelectedKey();
                            oEntry.operation_time = this._getConvertedTimeValue();
                        } else {
                            oEntry.dest_tank = sap.ui.getCore().byId("dest_tank").getSelectedKey();
                            oEntry.quantity = sap.ui.getCore().byId("quantity").getValue();
                        }

                        if (oEntry) {
                            this.onUpdate(sPath, oEntry, oToken);
                        } else {
                            new sap.m.MessageBox.error(this.getResourceBundle().getText("noPossibleOperationHeaderText"), {
                                title: this.getResourceBundle().getText("noPossibleOperationHeaderTitle"),
                                actions: [sap.m.MessageBox.Action.OK],
                                emphasizedAction: sap.m.MessageBox.Action.OK
                            });
                        }
                        this.onBuildGeneralDataSimpleForm(1);
                    }
                } else {
                    new sap.m.MessageBox.warning(this.getResourceBundle().getText("noDataEditedOperationHeaderText"), {
                        title: this.getResourceBundle().getText("noDataEditedOperationHeaderTitle"),
                        actions: [sap.m.MessageBox.Action.OK],
                        emphasizedAction: sap.m.MessageBox.Action.OK
                    });
                }
            },

            onPressEditOperationHeaderButton: function () {
                this.onBuildGeneralDataSimpleForm(2);
            },

            onPressCancelOperationHeaderButton: function () {
                var that = this,
                    oOperation = this.getModel().getObject(this.getView().getBindingContext().getPath()),
                    sEdited = this.onValidateEditedFieldsHeader("GeneralInfo", oOperation);

                if (sEdited) {
                    new sap.m.MessageBox.warning(this.getResourceBundle().getText("editOperationHeaderDataText"), {
                        title: this.getResourceBundle().getText("editOperationHeaderDataTitle"),
                        actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                        emphasizedAction: sap.m.MessageBox.Action.OK,
                        onClose: function (oAction) {
                            if (oAction === sap.m.MessageBox.Action.OK) {
                                that.onBuildGeneralDataSimpleForm(1);
                            }
                        }
                    });
                } else {
                    this.onBuildGeneralDataSimpleForm(1);
                }
            },
        });
    });
