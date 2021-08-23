'use strict';

module.exports = {
    en: {
        ACCOUNT_INFO_NOTIFICATIONS_EMAIL_SUBJECT: 'There are few free notifications left - %{host}',
        ACCOUNT_INFO_NOTIFICATIONS_EMAIL_TEXT: 'There are %{notifications} notifications left in account %{username}',

        ACCOUNT_INFO_NO_NOTIFICATIONS_EMAIL_SUBJECT: 'There are no free notifications left - %{host} ',
        ACCOUNT_INFO_NO_NOTIFICATIONS_EMAIL_TEXT: 'There are no more free notifications in account %{username}',

        ACCOUNT_INFO_MONEY_EMAIL_SUBJECT: 'There can be not enough money for notifications soon - %{host}',
        ACCOUNT_INFO_MONEY_EMAIL_TEXT: 'This sum of money left in account %{username}: ',

        ACCOUNT_INFO_NO_MONEY_EMAIL_SUBJECT: 'There are not enough money for notifications - %{host}',
        ACCOUNT_INFO_NO_MONEY_EMAIL_TEXT: 'There are no money in account %{username}',

        EMAIL_CALLBACK_REQUEST: 'CALLBACK request',
        SMS_CALLBACK_REQUEST: 'CALLBACK request',
        EMAIL_CALLBACK_REQUEST_DIGEST: 'Callback requests digest',
        EMAIL_CALLBACK_REQUESTS_DATE: 'Date',
        EMAIL_CALLBACK_REQUESTS_WIDGET_NAME: 'Widget name',
        EMAIL_CALLBACK_REQUESTS_WIDGET_URL: 'Link to page',
        EMAIL_CALLBACK_REQUESTS_PHONE_NUMBER: 'Phone number',
        EMAIL_CALLBACK_REQUESTS_RESULT: 'Result',
        EMAIL_CALLBACK_REQUESTS_ERROR_SUBJECT: 'Server error on callback request - %{host}',
        EMAIL_CALLBACK_REQUESTS_ERROR: 'Server error on callback request',
        EMAIL_CALLBACK_REQUESTS_ERROR1: 'There were system error while processing callback request for phone number "%{phone}".',
        EMAIL_CALLBACK_REQUESTS_ERROR2: 'We\'re working on it',
        EMAIL_CALLBACK_REQUESTS_ERROR3: 'Technical info:',
        EMAIL_COUNTRY: 'Country',
        EMAIL_REFERER: 'Callback request page',
        EMAIL_IP: 'Client IP',
        EMAIL_FOOTER_TEXT: 'Call42 Team, ',

        EMAIL_RESET_PASSWORD_SUBJECT: 'Reset password',
        EMAIL_RESET_PASSWORD_RESET_SUCCESS_SUBJECT: 'Your password has been changed',
        EMAIL_RESET_PASSWORD_TEXT1: 'You have requested to have your password reset for your account at ',
        EMAIL_RESET_PASSWORD_TEXT2: 'Please visit this url to reset your password:',
        EMAIL_RESET_PASSWORD_TEXT3: 'If you didn\'t make this request, you can ignore this email.',
        EMAIL_RESET_PASSWORD_CONFIRMATION: 'This is a confirmation that the password for your account %{name} has just been changed',
    },
    ru: {
        ACCOUNT_INFO_NOTIFICATIONS_EMAIL_SUBJECT: 'Заканчиваются бесплатные уведомления - %{host}',
        ACCOUNT_INFO_NOTIFICATIONS_EMAIL_TEXT: 'На счету Вашего аккаунта "%{username}" осталось "%{notifications}" бесплатных уведомлений',

        ACCOUNT_INFO_NO_NOTIFICATIONS_EMAIL_SUBJECT: 'Не осталось бесплатных уведомлений - %{host}',
        ACCOUNT_INFO_NO_NOTIFICATIONS_EMAIL_TEXT: 'На счету Вашего аккаунта "%{username}" не осталось бесплатных уведомлений',

        ACCOUNT_INFO_MONEY_EMAIL_SUBJECT: 'Заканчиваются средства для отправки уведомлений - %{host}',
        ACCOUNT_INFO_MONEY_EMAIL_TEXT: 'На счету Вашего аккаунта "%{username}" осталось ',

        ACCOUNT_INFO_NO_MONEY_EMAIL_SUBJECT: 'Закончились средства для отправки уведомлений - %{host}',
        ACCOUNT_INFO_NO_MONEY_EMAIL_TEXT: 'На счету Вашего аккаунта "%{username}" не осталось средств для отправки уведомлений',

        EMAIL_CALLBACK_REQUEST: 'ЗАПРОС на звонок',
        SMS_CALLBACK_REQUEST: 'ЗАПРОС на звонок',
        EMAIL_CALLBACK_REQUEST_DIGEST: 'Дайджест запросов на обратный звонок',
        EMAIL_CALLBACK_REQUESTS_DATE: 'Дата',
        EMAIL_CALLBACK_REQUESTS_WIDGET_NAME: 'Имя виджета',
        EMAIL_CALLBACK_REQUESTS_WIDGET_URL: 'Ссылка на страницу',
        EMAIL_CALLBACK_REQUESTS_PHONE_NUMBER: 'Номер телефона',
        EMAIL_CALLBACK_REQUESTS_RESULT: 'Результат',
        EMAIL_CALLBACK_REQUESTS_ERROR_SUBJECT: 'Ошибка во время запроса на обратный звонок - %{host}',
        EMAIL_CALLBACK_REQUESTS_ERROR1: 'При запросе на обратный звонок по номеру "%{phone}" произошла программная ошибка.',
        EMAIL_CALLBACK_REQUESTS_ERROR2: 'Мы уже над этим работаем.',
        EMAIL_CALLBACK_REQUESTS_ERROR3: 'Техническая информация:',
        EMAIL_COUNTRY: 'Страна',
        EMAIL_REFERER: 'Страница вызова',
        EMAIL_IP: 'IP адрес клиента',
        EMAIL_FOOTER_TEXT: 'Команда Call42,',

        EMAIL_RESET_PASSWORD_SUBJECT: 'Изменение пароля',
        EMAIL_RESET_PASSWORD_RESET_SUCCESS_SUBJECT: 'Ваш пароль был изменен',
        EMAIL_RESET_PASSWORD_TEXT1: 'Вы запросили изменение пароля для вашего аккаунта на ',
        EMAIL_RESET_PASSWORD_TEXT2: 'Для изменения пароля пожалуйста перейдите по ссылке:',
        EMAIL_RESET_PASSWORD_TEXT3: 'Если вы не делали этого запроса, можете проигнорировать это письмо',
        EMAIL_RESET_PASSWORD_CONFIRMATION: 'Пароль для вашего аккаунта %{name} только что был изменен',
    }
};
