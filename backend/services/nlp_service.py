# !pip install hanlp pypinyin

import hanlp
import os
from pypinyin import pinyin, Style

class NLPService:
    def __init__(self):
        # 確保模型路徑指向 Docker Volume 掛載的位置
        model_path = os.getenv('HANLP_HOME', '/app/hanlp_data')
        
        # 載入 HanLP 預訓練模型
        self.tok = hanlp.load(hanlp.pretrained.tok.COARSE_ELECTRA_SMALL_ZH)
        self.pos = hanlp.load(hanlp.pretrained.pos.CTB9_POS_ELECTRA_SMALL)

    def analyze_text(self, text: str):
        # 進行分詞
        tokens = self.tok(text)
        # 進行詞性標註
        pos_tags = self.pos(tokens)
        
        result = []
        for word, tag in zip(tokens, pos_tags):
            # 產生注音/拼音 (用於前端顯示)
            py_list = pinyin(word, style=Style.TONE)
            py_str = "".join([p[0] for p in py_list])
            
            result.append({
                "text": word,
                "pos": tag,
                "pinyin": py_str
            })
        return result