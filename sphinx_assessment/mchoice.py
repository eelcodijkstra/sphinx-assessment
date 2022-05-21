from docutils import nodes
from docutils.parsers.rst import directives

from sphinx.util import logging
from sphinx.util.docutils import SphinxDirective

logger = logging.getLogger(__name__)


class mchoicenode(nodes.Admonition, nodes.Element):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)


class MChoiceQuestion(nodes.General, nodes.Element):
    pass


class MCAnswerList(nodes.General, nodes.bullet_list):
    pass


class MCAnswerItem(nodes.General, nodes.Element):
    pass


class MCFeedbackList(nodes.General, nodes.bullet_list):
    pass


class MCFeedbackItem(nodes.General, nodes.Element):
    pass


class MChoiceDirective(SphinxDirective):
    has_content = True
    optional_arguments = 1
    required_arguments = 0
    final_argument_whitespace = True
    option_spec = {
        "correct": directives.unchanged,
        "multiple": directives.flag,
    }

    def run(self):
        if not ("correct" in self.options):
            raise self.error("multiple choice: 'correct' option missing")

        # Parse custom subtitle option
        if self.arguments != []:
            title_node = nodes.title(text="")
            subtitle = nodes.inline()
            subtitle_text = f" - {self.arguments[0]}"
            subtitle_nodes, _ = self.state.inline_text(subtitle_text, self.lineno)
            subtitle.extend(subtitle_nodes)
            title_node += subtitle
        else:
            title_node = nodes.title(text=" ")

        content_node = nodes.section(ids=["question"])  # question-part
        self.state.nested_parse(self.content, self.content_offset, content_node)

        if not (
            len(content_node) > 0 and isinstance(content_node[-1], nodes.bullet_list)
        ):
            raise self.error("multiple choice: answer list missing")

        bulletlist = content_node[-1]  # answer list
        content_node.pop()  # remove bullet list
        answerlist = MCAnswerList()  # dit moet een node zijn....
        feedbacklist = MCFeedbackList()  # idem

        itemnames = "abcdefghijklmnopqrstuvwxyz"
        itemnr = 0
        for item in bulletlist:
            if len(item) > 0 and isinstance(item[-1], nodes.bullet_list):
                listitem = item[-1][0]  # first item of sublist
                item.pop()  # remove sublist from original item
                if len(listitem) > 0 and isinstance(listitem[0], nodes.paragraph):
                    listitem = listitem[0]
                feedbackitem = MCFeedbackItem(
                    listitem.rawsource, *listitem.children, **listitem.attributes
                )

            else:
                feedbackitem = MCFeedbackItem()
                feedbackitem.append(nodes.Text("no feedback"))

            feedbackitem["data-value"] = itemnames[itemnr]
            feedbacklist.append(feedbackitem)

            if len(item) > 0 and isinstance(item[0], nodes.paragraph):
                item = item[0]

            answer = MCAnswerItem(item.rawsource, *item.children, **item.attributes)
            answer["answer"] = itemnames[itemnr]
            answer["ids"].append("answer-" + itemnames[itemnr])
            answerlist.append(answer)
            itemnr += 1

        mcnode = mchoicenode(rawsource=self.block_text)
        mcnode.source, mcnode.line = self.state_machine.get_source_and_line(self.lineno)

        mcnode.extend([title_node, content_node, answerlist, feedbacklist])
        mcnode["data-correct"] = self.options["correct"]

        return [mcnode]


def visit_mchoicenode(self, node):
    self.body.append(
        '<form class="mchoice admonition" onsubmit="return false;" data-correct="{}">\n'.format(
            node["data-correct"]
        )
    )


def depart_mchoicenode(self, node):
    self.body.append("</form>\n")


def visit_mcquestion(self, node):
    pass


def depart_mcquestion(self, node):
    pass


def visit_mcanswer(self, node):
    answeropen = """
  <div>
    <label>
      <input type="radio" name="answer" value="{a}"> {a})
"""
    self.body.append(answeropen.format(a=node["answer"]))


def depart_mcanswer(self, node):
    answerclose = """
    </label>
  </div>
"""
    self.body.append(answerclose)


def visit_mcanswerlist(self, node):
    pass


def depart_mcanswerlist(self, node):
    answerlistclose = """
  <div class="buttonpart">
    <button type="submit" class="checkbutton"> Check </button>
    <button type="reset" class="resetbutton"> Reset </button>
  </div>
"""
    self.body.append(answerlistclose)


def visit_mcfeedbacklist(self, node):
    self.body.append('<p class="feedback"></p>\n<ul class="feedbacklist">\n')


def depart_mcfeedbacklist(self, node):
    self.body.append("</ul>\n<p></p>\n")


def visit_mcfeedbackitem(self, node):
    self.body.append('<li data-value="{a}" hidden> {a}) '.format(a=node["data-value"]))


def depart_mcfeedbackitem(self, node):
    self.body.append("</li>\n")


def setup(app):
    app.add_directive("mchoice", MChoiceDirective)

    app.add_enumerable_node(
        mchoicenode,
        "assessment",
        None,
        html=(visit_mchoicenode, depart_mchoicenode),
        singlehtml=(visit_mchoicenode, depart_mchoicenode),
    )
    app.add_node(
        MChoiceQuestion,
        html=(visit_mcquestion, depart_mcquestion),
        singlehtml=(visit_mcquestion, depart_mcquestion),
    )
    app.add_node(
        MCAnswerItem,
        html=(visit_mcanswer, depart_mcanswer),
        singlehtml=(visit_mcanswer, depart_mcanswer),
    )
    app.add_node(
        MCAnswerList,
        html=(visit_mcanswerlist, depart_mcanswerlist),
        singlehtml=(visit_mcanswerlist, depart_mcanswerlist),
    )
    app.add_node(
        MCFeedbackList,
        html=(visit_mcfeedbacklist, depart_mcfeedbacklist),
        singlehtml=(visit_mcfeedbacklist, depart_mcfeedbacklist),
    )
    app.add_node(
        MCFeedbackItem,
        html=(visit_mcfeedbackitem, depart_mcfeedbackitem),
        singlehtml=(visit_mcfeedbackitem, depart_mcfeedbackitem),
    )

    return {
        "version": "0.1",
        "parallel_read_safe": True,
        "parallel_write_safe": True,
    }
