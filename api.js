// PUT /api/v1/courses/:course_id/assignments/:assignment_id/submissions/:user_id

function put(url) {}

function generateJSON(sid, rubric, finalMark) {
    return {
        rubric_assessment: {
            crit1: {
                points: rubric.A.points,
                comments: rubric.A.comments
            },
            crit2: {
                points: rubric.B.points,
                comments: rubric.B.comments
            },
            crit3: {
                points: rubric.C.points,
                comments: rubric.C.comments
            }
        },
        grade: finalMark
    }
}
