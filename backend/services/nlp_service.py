# !pip install hanlp pypinyin

import hanlp
import os
from pypinyin import pinyin, Style

class NLPService:
    def __init__(self):
        # If you want to run purely offline
        # model_path = os.getenv('HANLP_HOME', '/app/hanlp_data')
        
        self.tok = hanlp.load(hanlp.pretrained.tok.COARSE_ELECTRA_SMALL_ZH)
        self.pos = hanlp.load(hanlp.pretrained.pos.CTB9_POS_ELECTRA_SMALL)

    
    def analyze_text(self, text: str):
        tokens = self.tok(text)
        pos_tags = self.pos(tokens)
        
        result = []
        for word, tag in zip(tokens, pos_tags):
            py_list = pinyin(word, style=Style.TONE)
            py_str = "".join([p[0] for p in py_list])
            
            result.append({
                "text": word,
                "pos": tag,
                "pinyin": py_str
            })
        return result