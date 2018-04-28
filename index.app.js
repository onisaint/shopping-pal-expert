// @ts-check

(function () {
    // basic validation
    let question = {
        id: "",
        text: "",
        name: ""
    }

    const
        $eleInfo = document.getElementById("i-sp-info"),
        $eleAnswerBtn = document.getElementById("i-sp-button"),
        // ele Validate objects
        $eleAnswerInput = document.getElementById("i-sp-answer"),
        $eleEntityInput = document.getElementById("i-sp-entity"),
        $eleIntentInput = document.getElementById("i-sp-intent"),
        // load screen
        $eleLoadScreen = document.getElementById("i-sp-load-screen"),
        $eleSpLoading = document.getElementById("i-sp-loading"),
        $eleThanks = document.getElementById("i-sp-help-loader"),
        $eleLoaderText = document.getElementById("i-sp-load-text"),
        // question screnn
        $eleQuestionScreen = document.getElementById("i-sp-question-screen"),
        $eleQuestionId = document.getElementById("i-sp-question-id"),
        $eleQuestionText = document.getElementById("i-sp-question"),
        // form
        $eleForm = document.getElementById("sp-form");

    const
        /**
         * @description mock API only for 24 hrs from 23 april 2018 : 12hrs:48min 
         */
        ApiEndPoint = "http://18.130.69.207:8080/cognitivelearning";


    // TODO: manage Intervals
    let _queryIntervalHolder;

    startFetchQuestionInterval();
    fetchQuestion();

    function startFetchQuestionInterval() {
        _queryIntervalHolder = setInterval(fetchQuestion, 15e3);
    }

    function fetchQuestion() {
        _getData(
            `${ApiEndPoint}/queryExpert/getQueryToAnswer`
        )
            .then(function (data) {
                if (data.question_id) {
                    // TODO: clear interval and set data
                    clearInterval(_queryIntervalHolder);
                    $eleEntityInput.innerHTML = "";
                    question = { ...question, ...{ id: data.question_id, text: data.question_text, name: data.product_name } };
                    $eleQuestionId.innerText = question.name;
                    $eleQuestionText.innerText = question.text;

                    // create entities
                    question
                        .text
                        .toLowerCase()
                        .replace("?", "")
                        .trim()
                        .split(" ")
                        .map(function (value) {
                            const option = document.createElement("option");
                            option.value = value;
                            option.innerText = value;
                            $eleEntityInput.appendChild(option);
                        })

                    $eleLoadScreen.classList.add("hidden");
                    $eleQuestionScreen.classList.remove("hidden");
                }
            })
    }

    $eleAnswerBtn.addEventListener(
        "click",
        function ($event) {
            const
                // @ts-ignore
                answer = $eleAnswerInput.value,
                // @ts-ignore
                entity = $eleEntityInput.value,
                // @ts-ignore
                intent = $eleIntentInput.value;

            if (!answer || !entity || !intent || !!intent.match(" ")) {
                $eleInfo.innerText = "Please Fill In all Details!";
                if (!!intent.match(" ")) {
                    $eleIntentInput.classList.add("sp-is-err");
                    $eleInfo.innerText = "*No Spaces Allowed here!";
                    $eleInfo.classList.remove("hidden");
                }
                $eleInfo.classList.remove("hidden");
                return;
            } else {
                $eleAnswerBtn.innerText = "Thanks!";
                $eleAnswerBtn.setAttribute("disabled", "true");
                _postData(
                    `${ApiEndPoint}/queryExpert/answerDetails`,
                    {
                        "question_id": question.id,
                        "question_text": question.text,
                        "product_name": question.name,
                        "answer_text": answer,
                        "intent": intent,
                        "entities": entity
                    }
                )
                    .then(function (data) {
                        // TODO: revert button to prestine and set the loader screen;
                        $eleAnswerBtn.innerText = "Answer";
                        $eleAnswerBtn.removeAttribute("disabled");
                        // @ts-ignore reset works with ed-chrome-wv-55 and above
                        $eleForm.reset();

                        $eleQuestionScreen.classList.add("hidden");
                        $eleLoadScreen.classList.remove("hidden");

                        $eleLoaderText.innerText = "Thanks for your expertise!"
                        $eleSpLoading.classList.add("hidden");
                        $eleThanks.classList.remove("hidden");

                        setTimeout(function () {
                            $eleLoaderText.innerText = "Waiting for the customer query."
                            $eleSpLoading.classList.remove("hidden");
                            $eleThanks.classList.add("hidden");
                            startFetchQuestionInterval();
                        }, 1500)
                    })
            }

        }
    )

    /**
     * @method GET
     * @description Does a GET request on url
     * @param {String} url 
     * @returns {Object} json Data output
     */
    function _getData(url) {
        return fetch(url, {
            method: 'GET'
        })
            .then(function (response) {
                return response.json();
            })
    }

    /**
     * @method POST
     * @description Does a post request on the url with data
     * @param {String} url 
     * @param {Object} data
     * @returns {Object} json Data output
     */
    function _postData(url, data) {
        return fetch(url, {
            body: JSON.stringify(data),
            method: 'POST'
        })
            .then(function (response) {
                return response.text();
            })
    }
})()