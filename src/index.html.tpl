<!DOCTYPE HTML>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="A cross-platform financial charting application to showcase the functionality of d3fc components">
    <title>d3fc Showcase</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <!-- Version: <%- version %> -->
</head>
<body>
<div class="container" id="app-container">
    <div class="row head-menu head-row">
        <div class="col-md-12 head-sub-row">
            <div id="product-dropdown" class="dropdown product-dropdown"></div>
            <div id="period-selector"></div>
        </div>
    </div>
    <div class="row primary-row">
        <div class="col-md-12" id="loading-message">
            <p class="content">Loading...</p>
        </div>
        <div id="charts" class="col-md-12 hidden">
            <div id="charts-container">
                <svg id="primary-container"></svg>
                <svg class="secondary-container"></svg>
                <svg class="secondary-container"></svg>
                <svg class="secondary-container"></svg>
                <div class="x-axis-row">
                    <svg id="x-axis-container"></svg>
                </div>
                <div id="navbar-row">
                    <svg id="navbar-container"></svg>
                    <svg id="navbar-reset"></svg>
                </div>
            </div>
            <div id="overlay">
                <div id="overlay-primary-container">
                    <div id="overlay-primary-head">
                        <div id="selectors">
                            <div id="series-dropdown" class="dropdown selector-dropdown"></div>
                            <div id="indicator-dropdown" class="dropdown selector-dropdown"></div>
                        </div>
                        <div id="legend"></div>
                    </div>
                    <div id="overlay-primary-bottom">
                        <div class="edit-indicator-container"></div>
                    </div>
                </div>
                <div class="overlay-secondary-container">
                    <div class="edit-indicator-container"></div>
                </div>
                <div class="overlay-secondary-container">
                    <div class="edit-indicator-container"></div>
                </div>
                <div class="overlay-secondary-container">
                    <div class="edit-indicator-container"></div>
                </div>
                <div class="x-axis-row"></div>
                <div id="overlay-navbar-row"></div>
            </div>
        </div>
    </div>
</div>
<% if (development) { %>
<% _.forEach(developmentVendorJsFiles, function(filePath) {
%><script src="<%- filePath %>"></script>
<%
}); %>
<% } %>
<script src="<%- appJsPath %>"></script>
<%= liveReload === true ? '<script src="//localhost:35729/livereload.js"></script>' : '' %>
</body>
</html>