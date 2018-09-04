sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"sap/ui/model/Filter"
], function(BaseController, JSONModel, History, Filter) {
	"use strict";

	return BaseController.extend("GitHubGitHub.controller.Master", {
		onInit: function() {
			var self = this;
			this.loaddata(self, "full_name");
		},

		/*
		@Method
		@2 parameters :control and filter parameter
		@Public
		to load the service and bind the data to the model 
		to bind the model to the list 
		master list with the list items with git hub items
		*/
		
		loaddata: function(self, sortFilter) {
			self.byId("page").setShowNavButton(false);
			//To get the control of the view
			var viewDetail = self.getOwnerComponent()._oViews._oViews["GitHubGitHub.view.Detail"];
			viewDetail.byId("vboxParent").setVisible(true);
			viewDetail.byId("vboxChild").setVisible(false);
			self.byId("List").setBusy(true);
			//To set the URL from the service,initially the sortFilter is fullname 
			//later this will change based on sort criteria
			var url = "https://api.github.com/users/sap/repos?sort=" + sortFilter;
			//set the model with the data from the url
			var model = new sap.ui.model.json.JSONModel(url);
			//set the list item with the items from the model
			model.attachRequestCompleted(function() {
				self.getView().setModel(model);
				self.getView().getModel().setProperty("/items", model.oData);
				viewDetail.setModel(new sap.ui.model.json.JSONModel(model.oData[0]));
				self.byId("List").setBusy(false);
			});
		},

		/*
		@Method
		@1 parameter :control of item pressed
		@Public
		To handle the item press on the master page 
		Show the details on the right hand side
		Load the contributer details in the Master view list 
		*/
		handleListItemPress: function(evt) {
			//Get the full_name of the selected item
			var selectedItem = evt.getSource().getBindingContext().getProperty("full_name");
			var self = this;
			//Button Navigation is set true
			self.byId("page").setShowNavButton(true);
			var data = evt.getSource().data("Id");
			//set the data to view details
			var viewDetail = self.getOwnerComponent()._oViews._oViews["GitHubGitHub.view.Detail"];
			if (data.created_at) {
				viewDetail.setModel(new sap.ui.model.json.JSONModel(data));
			} else {
				viewDetail.setModel(new sap.ui.model.json.JSONModel(data));
				viewDetail.byId("vboxChild").setVisible(true);
				viewDetail.byId("vboxParent").setVisible(false);
			}
			var modelParent;
			//To set the master list item with the Contributer data
			if (selectedItem) {
				var url = "https://api.github.com/repos/" + selectedItem + "/contributors";
				//Set the model with the contributer items according to the item selected in the main git item list
				modelParent = new sap.ui.model.json.JSONModel(url);
				//Set the list with the model data
				modelParent.attachRequestCompleted(function() {
					for (var i = 0; i < modelParent.oData.length; i++) {
						modelParent.oData[i].name = modelParent.oData[i].login;
					}
					self.getView().setModel(modelParent);
					self.getView().getModel().setProperty("/items", modelParent.oData);
				});
			}

		},

		/*
		@Method
		@1 parameter :control of item pressed
		@Public
		search functionality
		*/
		handleSearch: function(evt) {
			// create model filter
			var filters = [];
			//Get the data entered in the Search field
			var query = evt.getParameter("query");
			//fetch the items matching from the item list
			if (query && query.length > 0) {
				var filter = new sap.ui.model.Filter("name", sap.ui.model.FilterOperator.Contains, query);
				filters.push(filter);
			}
			//update list binding 
			var list = this.getView().byId("List");
			var binding = list.getBinding("items");
			binding.filter(filters);
		},

		/*
		@Method
		@Public
		navigate back to the main list
		*/
		onNavBack: function() {
			this.loaddata(this, "full_name");
		},
		/*
		@Method
		@1 parameter :control of item pressed
		@Public
		to call the dialog box for the sort functionality
		*/
		onOpenViewSettings: function(oEvent) {
			if (!this._oViewSettingsDialog) {
				this._oViewSettingsDialog = sap.ui.xmlfragment("GitHubGitHub.view.ViewSettingsDialog", this);
				this.getView().addDependent(this._oViewSettingsDialog);
				// forward compact/cozy style into Dialog
				this._oViewSettingsDialog.addStyleClass(this.getOwnerComponent().getContentDensityClass());
			}
			var sDialogTab = "sort";
			this._oViewSettingsDialog.open(sDialogTab);
			//to hide UI5 Asc/Dsc radio buttons 
			$("[aria-labelledby='viewSettingsDialog-sortOrderLabel']").css("display", "none");
		},
		/*
		@Method
		@1 parameter :control of item pressed
		@Public
		To handle the OK Button of the sort dialog box
		*/
		onConfirmViewSettingsDialog: function(oEvent) {
			this.loaddata(this, oEvent.getSource().getSelectedSortItem());
		}
	});

});