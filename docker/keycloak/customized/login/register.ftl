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
        flex-wrap: wrap !important;
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

    .field-error {
        flex: 0 0 100% !important;
        padding-left: 150px !important;
        box-sizing: border-box !important;
        color: #cc0000 !important;
        font-size: 12px !important;
        overflow-wrap: break-word !important;
    }
</style>

<@layout.registrationLayout displayMessage=!messagesPerField.existsError('firstName','lastName','email','username','password','password-confirm','cip'); section>
    <#if section = "header">
        Register for Access
    <#elseif section = "form">
        <form id="kc-register-form" action="${url.registrationAction}" method="post">
            <div class="form-group">
                <label for="user.attributes.cip">CIP</label>
                <input type="text" id="user.attributes.cip" name="user.attributes.cip" required placeholder="ex: ABCD1234" value="${(register.formData['user.attributes.cip']!'')}" />
                <#if messagesPerField.existsError('cip')>
                    <span class="field-error">${kcSanitize(messagesPerField.get('cip'))?no_esc}</span>
                </#if>
            </div>

            <div class="form-group">
                <label for="username">Username</label>
                <input type="text" id="username" name="username" required placeholder="3 caractères minimum" value="${(register.formData.username!'')}" />
                <#if messagesPerField.existsError('username')>
                    <span class="field-error">${kcSanitize(messagesPerField.get('username'))?no_esc}</span>
                </#if>
            </div>


            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" required placeholder="@usherbrooke.ca" value="${(register.formData.email!'')}" />
                <#if messagesPerField.existsError('email')>
                    <span class="field-error">${kcSanitize(messagesPerField.get('email'))?no_esc}</span>
                </#if>
            </div>

            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required />
                <#if messagesPerField.existsError('password')>
                    <span class="field-error">${kcSanitize(messagesPerField.get('password'))?no_esc}</span>
                </#if>
            </div>

            <div class="form-group">
                <label for="password-confirm">Confirm Password</label>
                <input type="password" id="password-confirm" name="password-confirm" required />
                <#if messagesPerField.existsError('password-confirm')>
                    <span class="field-error">${kcSanitize(messagesPerField.get('password-confirm'))?no_esc}</span>
                </#if>
            </div>

            <div class="form-group">
                <label for="lastName">Last Name</label>
                <input type="text" id="lastName" name="lastName" required placeholder="ex: Dupont" value="${(register.formData.lastName!'')}" />
                <#if messagesPerField.existsError('lastName')>
                    <span class="field-error">${kcSanitize(messagesPerField.get('lastName'))?no_esc}</span>
                </#if>
            </div>

            <div class="form-group">
                <label for="firstName">First Name</label>
                <input type="text" id="firstName" name="firstName" required placeholder="ex: Jean" value="${(register.formData.firstName!'')}" />
                <#if messagesPerField.existsError('firstName')>
                    <span class="field-error">${kcSanitize(messagesPerField.get('firstName'))?no_esc}</span>
                </#if>
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

        <script>
            document.querySelectorAll('#kc-register-form input').forEach(input => {
                input.addEventListener('blur', function() {
                    const group = this.closest('.form-group');
                    if (!group) return;
                    let errorSpan = group.querySelector('.field-error');
                    const name = this.name;
                    let msg = '';

                    if (name === 'user.attributes.cip') {
                        const re = /^[A-Za-z]{4}[0-9]{4}$/;
                        if (this.value && !re.test(this.value))
                            msg = 'Format invalide — 4 lettres suivies de 4 chiffres (ex: ABCD1234)';
                    } else if (name === 'username') {
                        if (this.value && this.value.length < 3)
                            msg = '3 caractères minimum';
                    } else if (name === 'email') {
                        if (this.value && (!this.value.includes('@') || !this.value.includes('.')))
                            msg = 'Adresse email invalide';
                    } else if (name === 'password-confirm') {
                        const pw = document.getElementById('password');
                        if (this.value && pw && this.value !== pw.value)
                            msg = 'Les mots de passe ne correspondent pas';
                    }

                    if (msg) {
                        if (!errorSpan) {
                            errorSpan = document.createElement('span');
                            errorSpan.className = 'field-error';
                            group.appendChild(errorSpan);
                        }
                        errorSpan.textContent = msg;
                    } else if (errorSpan) {
                        errorSpan.remove();
                    }
                });
            });
        </script>
    </#if>
</@layout.registrationLayout>