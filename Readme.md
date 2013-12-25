# Похоронное Дело (Web application) AngularJS + Grunt

## Используемые технологии

* [AngularJS (~1.2.6)](http://angularjs.org)
* [Grunt (~0.4.1)](http://gruntjs.com)
* [Bower](http://bower.io/)
* [Sass](http://sass-lang.com/) + [Compass](http://compass-style.org/)

## Requirements

Для разворачивания проекта должны быть установлены:

* nodejs + npm
* ruby, sass(+ compass)
```
gem install compass
```
* npm пакеты
```
npm install -g grunt-cli bower
```

## Разворачивание проекта

Установка/обновление npm пакетов проекта:
```
npm install
```

Установка/обновление bower пакетов:
```
bower install
```

## Использование grunt тасков

Для запуска и разработки на локальном компьютере использовать команду:
```
grunt serve
```

, собрать билд (выполняет таски: минификация, конкатенация и пр. и складывает в папку build):
```
grunt build
```

, запустить тесты:
```
grunt test
```

. и проверка кодстайла:
```
grunt jshint
```

## Замечания по единому стилю написания кода и использованию инструментов

* Кодстайл будет проверяться jshint'ом и его настройки описаны в файле .jshintrc (если пользуетесь PhpStorm'ом, то этот файл
 можно подключить в настройках для проекта и будет подсвечивать в коде неверное использование)
* Отступы в проекте (html, js, scss) - 2 пробела
* В проекте используется livereload плагин для grunt -> нет необходимости обновлять страницу в браузере при изменении
кода (js, html, css) и структуры (добавление картинок и тд), обновление будет происходить само.
* Для устанавки js библиотек использовать bower `bower search [jslib]`
```
bower search jquery
bower install jquery --save
```

### ToDo

* Настроить Continuous Integration для запуска тестов и проверки codestyle.
* Настроить e2e тесты