<#import "template.ftl" as layout>
<style>
    /* --- 1. Contain the Button --- */
    /* overflow: auto forces the card to stretch and contain any floating or escaping elements */
    .login-pf-page .card-pf,
    div[class*="login-pf"] {
        height: auto !important;
        min-height: min-content !important;
        padding-bottom: 5px !important;
        overflow: auto !important;
    }

    /* --- 2. Left-Align Labels & Align Inputs --- */
    .form-group {
        display: flex !important;
        flex-direction: row !important;
        align-items: center !important;
        margin-bottom: 15px !important;
        padding: 0 20px !important; /* Keeps fields from touching the edges of the box */
    }

    .form-group label {
        flex: 0 0 140px !important; /* Fixed width keeps all inputs starting at the exact same pixel */
        text-align: left !important; /* Aligns the text to the left */
        font-weight: bold !important;
        margin-right: 10px !important;
        color: #333 !important;
    }

    .form-group input {
        flex: 1 !important; /* Inputs stretch to fill the rest of the line evenly */
        padding: 10px !important;
        border: 1px solid #ccc !important;
        border-radius: 4px !important;
        box-sizing: border-box !important;
    }

    /* --- 3. Center the Register Button --- */
    #kc-form-buttons {
        display: flex !important;
        justify-content: center !important;
        margin-top: 30px !important;
        margin-bottom: 20px !important;
        position: static !important; /* Stops the button from breaking out of the document flow */
    }

    #kc-form-buttons input[type="submit"] {
        width: 100% !important;
        max-width: 300px !important;
    }
</style>

<@layout.registrationLayout displayMessage=!messagesPerField.existsError('firstName','lastName','email','username','password','password-confirm'); section>
    <#if section = "header">
        Register for Access
    <#elseif section = "form">
        <form id="kc-register-form" action="${url.registrationAction}" method="post">
            <div class="form-group">
                <label for="user.attributes.cip">CIP</label>
                <input type="text" id="user.attributes.cip" name="user.attributes.cip" required />
            </div>

            <div class="form-group">
                <label for="username">Username</label>
                <input type="text" id="username" name="username" required />
            </div>


            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" required />
            </div>

            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required />
            </div>

            <div class="form-group">
                <label for="password-confirm">Confirm Password</label>
                <input type="password" id="password-confirm" name="password-confirm" required />
            </div>

            <div class="form-group">
                <label for="lastName">Last Name</label>
                <input type="text" id="lastName" name="lastName" required />
            </div>

            <div class="form-group">
                <label for="firstName">First Name</label>
                <input type="text" id="firstName" name="firstName" required />
            </div>

            <div id="kc-form-buttons" class="${properties.kcFormButtonsClass!}">
                <input class="${properties.kcButtonClass!} ${properties.kcButtonPrimaryClass!} ${properties.kcButtonBlockClass!} ${properties.kcButtonLargeClass!}" type="submit" value="Register" />
            </div>

            <div class="${properties.kcFormGroupClass!}">
                <div id="kc-form-options" class="${properties.kcFormOptionsClass!}">
                    <div class="${properties.kcFormOptionsWrapperClass!}">
            <span>
                <a href="${url.loginUrl}">
                    ${kcSanitize(msg("backToLogin"))?no_esc}
                </a>
            </span>
                    </div>
                </div>
            </div>
        </form>
    </#if>
</@layout.registrationLayout>