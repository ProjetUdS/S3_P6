package ca.usherbrooke.fgen.api.mapper;

import ca.usherbrooke.fgen.api.business.Discussion;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface DiscussionMemberMapper {

    void insertMember(@Param("discussionId") String discussionId, @Param("cip") String cip);

    void insertMembers(@Param("discussionId") String discussionId, @Param("cips") List<String> cips);
}
